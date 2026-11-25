<?php
// Never print PHP errors to visitors (they leak paths, queries and credentials).
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');

try {
    // High-performance reverse proxy with Native PHP PDO Fallback for Node.js API
    $nodePort = 5000;
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    $targetUrl = 'http://127.0.0.1:' . $nodePort . $requestUri;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD'] ?? 'GET');
    curl_setopt($ch, CURLOPT_TIMEOUT, 3); // Fast 3-second timeout

    // Forward incoming HTTP headers (Authorization, Content-Type, etc.)
    $forwardHeaders = [];
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $val) {
            $lower = strtolower($name);
            if ($lower !== 'host' && $lower !== 'content-length') {
                $forwardHeaders[] = "$name: $val";
            }
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $forwardHeaders);

    // Forward payload for POST / PUT / PATCH / DELETE
    $input = file_get_contents('php://input');
    if (!empty($input)) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
    }

    // Forward cookies for JWT refresh tokens
    if (!empty($_COOKIE)) {
        $cookies = [];
        foreach ($_COOKIE as $k => $v) {
            $cookies[] = "$k=$v";
        }
        curl_setopt($ch, CURLOPT_COOKIE, implode('; ', $cookies));
    }

    $response = curl_exec($ch);

    // If Node.js responded successfully, return its response
    if ($response !== false) {
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headersStr = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize);
        curl_close($ch);

        // If Node.js returned a valid response (< 500), serve it directly
        if ($httpCode > 0 && $httpCode < 500) {
            http_response_code($httpCode);
            $headers = explode("\r\n", $headersStr);
            foreach ($headers as $h) {
                if (!empty($h) && !preg_match('/^Transfer-Encoding:/i', $h) && !preg_match('/^HTTP\//i', $h)) {
                    header($h, false);
                }
            }
            echo $body;
            exit;
        }
    } else {
        curl_close($ch);
    }
} catch (Throwable $e) {
    // Continue to PDO fallback if curl failed
}

// =========================================================================
// 🚀 NATIVE PHP PDO FALLBACK (Ensures 100% Uptime for Store even if Node sleeps)
// =========================================================================

// Try to auto-resurrect Node.js daemon in background
if (function_exists('shell_exec')) {
    @shell_exec('nohup /home/u383896879/.nvm/versions/node/v20.20.2/bin/node ' . __DIR__ . '/server/index.js > ' . __DIR__ . '/server.log 2>&1 &');
    @shell_exec('nohup node ' . __DIR__ . '/server/index.js > ' . __DIR__ . '/server.log 2>&1 &');
}

// Read configuration from .env only (no credentials are hard-coded in this file).
function env_config() {
    static $cfg = null;
    if ($cfg !== null) return $cfg;
    $cfg = [];
    $envFile = __DIR__ . '/.env';
    if (is_readable($envFile)) {
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
            list($k, $v) = explode('=', $line, 2);
            $cfg[trim($k)] = trim(trim($v), '"\'');
        }
    }
    return $cfg;
}

$pdo_error = null;
function get_pdo_connection() {
    global $pdo_error;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $cfg = env_config();
    $dbHost = $cfg['DB_HOST'] ?? 'localhost';
    $dbPort = (int)($cfg['DB_PORT'] ?? 3306);
    $dbName = $cfg['DB_NAME'] ?? '';
    $dbUser = $cfg['DB_USER'] ?? '';
    $dbPass = $cfg['DB_PASSWORD'] ?? '';

    try {
        $dsn = "mysql:host=$dbHost;port=$dbPort;dbname=$dbName;charset=utf8mb4";
        $pdo = new PDO($dsn, $dbUser, $dbPass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
        return $pdo;
    } catch (Throwable $e) {
        $pdo_error = $e->getMessage();
        return null;
    }
}

$pdo = get_pdo_connection();
if (!$pdo) {
    http_response_code(502);
    header('Content-Type: application/json');
    error_log('[api.php] DB connection failed: ' . ($pdo_error ?? 'unknown'));
    echo json_encode([
        'success' => false,
        'message' => 'Backend database temporarily unavailable. Please retry in a few seconds.'
    ]);
    exit;
}

// ---- Auth helpers (mirror the Node backend's JWT check) ----
function b64url_decode($data) {
    $data = strtr($data, '-_', '+/');
    $pad = strlen($data) % 4;
    if ($pad) $data .= str_repeat('=', 4 - $pad);
    return base64_decode($data, true);
}

function verify_jwt_hs256($token, $secret) {
    if (!$token || !$secret) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($h, $p, $sig) = $parts;
    $header = json_decode(b64url_decode($h) ?: '', true);
    if (!is_array($header) || ($header['alg'] ?? '') !== 'HS256') return null;
    $expected = rtrim(strtr(base64_encode(hash_hmac('sha256', "$h.$p", $secret, true)), '+/', '-_'), '=');
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(b64url_decode($p) ?: '', true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && time() >= (int)$payload['exp']) return null;
    return $payload;
}

function current_user($pdo) {
    $cfg = env_config();
    $accessSecret = $cfg['JWT_ACCESS_SECRET'] ?? '';
    $refreshSecret = $cfg['JWT_REFRESH_SECRET'] ?? '';
    $payload = null;

    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$auth && function_exists('getallheaders')) {
        foreach (getallheaders() as $k => $v) {
            if (strtolower($k) === 'authorization') { $auth = $v; break; }
        }
    }
    if (stripos($auth, 'Bearer ') === 0) {
        $payload = verify_jwt_hs256(trim(substr($auth, 7)), $accessSecret);
    }
    if (!$payload && !empty($_COOKIE['refreshToken'])) {
        $payload = verify_jwt_hs256($_COOKIE['refreshToken'], $refreshSecret);
    }
    if (!$payload || empty($payload['id'])) return null;

    $stmt = $pdo->prepare('SELECT id, email, role FROM users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $payload['id']]);
    return $stmt->fetch() ?: null;
}

function is_admin_user($user) {
    return $user && in_array($user['role'] ?? '', ['admin', 'supermanager', 'superadmin'], true);
}

function deny($code, $message) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

function server_error($e) {
    error_log('[api.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Something went wrong. Please try again.']);
    exit;
}

// Parse request path
$parsedUrl = parse_url($requestUri);
$path = $parsedUrl['path'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

header('Content-Type: application/json; charset=utf-8');

// 1. GET /api/products
if ($method === 'GET' && preg_match('#^/api/products/?$#', $path)) {
    try {
        $stmt = $pdo->query('SELECT * FROM products ORDER BY created_at DESC, id DESC');
        $rows = $stmt->fetchAll();
        $products = array_map(function($r) {
            $colors = [];
            if (!empty($r['colors'])) {
                $dec = json_decode($r['colors'], true);
                $colors = is_array($dec) ? $dec : array_filter(array_map('trim', explode(',', $r['colors'])));
            }
            $images = [];
            if (!empty($r['image'])) {
                $dec = json_decode($r['image'], true);
                if (is_array($dec) && !empty($dec)) {
                    $images = $dec;
                } elseif (strpos($r['image'], '|') !== false) {
                    $images = array_filter(array_map('trim', explode('|', $r['image'])));
                } else {
                    $images = [trim($r['image'])];
                }
            }
            $mainImg = !empty($images) ? $images[0] : '';
            return [
                'id' => (string)$r['id'],
                'sku' => !empty($r['sku']) ? $r['sku'] : 'VNT-GEN-' . substr((string)$r['id'], 0, 4),
                'name' => $r['name'],
                'brand' => $r['brand'],
                'category' => $r['category'],
                'price' => (float)$r['price'],
                'discountPrice' => $r['discount_price'] !== null ? (float)$r['discount_price'] : null,
                'stock' => (int)($r['stock'] ?? 10),
                'colors' => $colors,
                'images' => $images,
                'image' => $mainImg,
                'altText' => $r['alt_text'] ?? $r['name'],
                'description' => $r['description'] ?? '',
                'isFeatured' => (bool)$r['is_featured'],
                'isBestSeller' => (bool)$r['is_bestseller'],
                'isNewArrival' => (bool)$r['is_new'],
                'createdAt' => $r['created_at']
            ];
        }, $rows);
        echo json_encode(['success' => true, 'count' => count($products), 'products' => $products]);
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 2. GET /api/products/:id
if ($method === 'GET' && preg_match('#^/api/products/([^/]+)$#', $path, $matches)) {
    $prodId = urldecode($matches[1]);
    try {
        $stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id OR sku = :sku LIMIT 1');
        $stmt->execute([':id' => $prodId, ':sku' => $prodId]);
        $r = $stmt->fetch();
        if ($r) {
            $images = [];
            if (!empty($r['image'])) {
                $dec = json_decode($r['image'], true);
                if (is_array($dec) && !empty($dec)) {
                    $images = $dec;
                } elseif (strpos($r['image'], '|') !== false) {
                    $images = array_filter(array_map('trim', explode('|', $r['image'])));
                } else {
                    $images = [trim($r['image'])];
                }
            }
            $product = [
                'id' => (string)$r['id'],
                'sku' => !empty($r['sku']) ? $r['sku'] : 'VNT-GEN-' . substr((string)$r['id'], 0, 4),
                'name' => $r['name'],
                'brand' => $r['brand'],
                'category' => $r['category'],
                'price' => (float)$r['price'],
                'discountPrice' => $r['discount_price'] !== null ? (float)$r['discount_price'] : null,
                'stock' => (int)($r['stock'] ?? 10),
                'images' => $images,
                'image' => !empty($images) ? $images[0] : '',
                'altText' => $r['alt_text'] ?? $r['name'],
                'description' => $r['description'] ?? '',
                'isFeatured' => (bool)$r['is_featured'],
                'isBestSeller' => (bool)$r['is_bestseller'],
                'isNewArrival' => (bool)$r['is_new'],
                'createdAt' => $r['created_at']
            ];
            echo json_encode(['success' => true, 'product' => $product]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Product not found']);
        }
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 3. GET /api/categories
if ($method === 'GET' && preg_match('#^/api/categories/?$#', $path)) {
    try {
        $stmt = $pdo->query("SELECT id, name, icon, image, count, description FROM categories WHERE count > 0 AND id NOT IN ('groceries', 'sneakers', 'gaming-vr') ORDER BY name ASC");
        $categories = $stmt->fetchAll();
        echo json_encode(['success' => true, 'count' => count($categories), 'categories' => $categories]);
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 4. GET /api/settings
if ($method === 'GET' && preg_match('#^/api/settings/?$#', $path)) {
    try {
        $stmt = $pdo->query("SELECT `key`, `value` FROM settings");
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $r) {
            $dec = json_decode($r['value'], true);
            $settings[$r['key']] = ($dec !== null && json_last_error() === JSON_ERROR_NONE) ? $dec : $r['value'];
        }
        echo json_encode(['success' => true, 'settings' => $settings]);
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 5. GET /api/orders (List all orders for Super Admin & syncing)
if ($method === 'GET' && preg_match('#^/api/orders/?$#', $path)) {
    $authUser = current_user($pdo);
    if (!$authUser) deny(401, 'Please log in to view orders.');
    try {
        if (is_admin_user($authUser)) {
            $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = :uid OR LOWER(customer_email) = LOWER(:email) ORDER BY created_at DESC");
            $stmt->execute([':uid' => $authUser['id'], ':email' => $authUser['email'] ?? '']);
        }
        $rows = $stmt->fetchAll();
        $orders = [];
        foreach ($rows as $r) {
            $items = [];
            if (!empty($r['items'])) {
                $items = json_decode($r['items'], true) ?: [];
            }
            $shippingDetails = [
                'fullName' => $r['customer_name'] ?? 'Valued Customer',
                'street' => $r['shipping_address'] ?? 'Dubai, UAE',
                'city' => 'Dubai',
                'state' => 'Dubai',
                'zip' => '00000',
                'country' => 'United Arab Emirates',
                'email' => $r['customer_email'] ?? '',
                'phone' => $r['customer_phone'] ?? ''
            ];
            if (!empty($r['shipping_address']) && is_string($r['shipping_address']) && str_starts_with(trim($r['shipping_address']), '{')) {
                $parsedShip = json_decode($r['shipping_address'], true);
                if (is_array($parsedShip)) {
                    $shippingDetails = array_merge($shippingDetails, $parsedShip);
                }
            }
            $orders[] = [
                'id' => $r['id'],
                'orderId' => $r['id'],
                'userId' => $r['user_id'] ?? null,
                'customerName' => $r['customer_name'] ?? $shippingDetails['fullName'],
                'customerEmail' => $r['customer_email'] ?? $shippingDetails['email'],
                'customerPhone' => $r['customer_phone'] ?? $shippingDetails['phone'],
                'shippingAddress' => $r['shipping_address'],
                'shippingDetails' => $shippingDetails,
                'items' => $items,
                'totals' => [
                    'total' => (float)($r['total_amount'] ?? 0),
                    'subtotal' => (float)($r['total_amount'] ?? 0),
                    'shipping' => 0,
                    'discount' => 0,
                    'tax' => 0
                ],
                'totalAmount' => (float)($r['total_amount'] ?? 0),
                'currency' => $r['currency'] ?? 'AED',
                'paymentMethod' => $r['payment_method'] ?? 'Cash on Delivery',
                'paymentStatus' => $r['payment_status'] ?? 'Pending',
                'status' => $r['order_status'] ?? 'Processing',
                'orderStatus' => $r['order_status'] ?? 'Processing',
                'date' => !empty($r['created_at']) ? date('M j, Y', strtotime($r['created_at'])) : date('M j, Y'),
                'createdAt' => $r['created_at'] ?? date('Y-m-d H:i:s')
            ];
        }
        echo json_encode([
            'success' => true,
            'count' => count($orders),
            'orders' => $orders
        ]);
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 6. GET /api/orders/:id (For OrderChatbot tracking)
if ($method === 'GET' && preg_match('#^/api/orders/([^/]+)$#', $path, $matches)) {
    $orderId = urldecode($matches[1]);
    $cleanId = preg_replace('/^ORD-/i', '', $orderId);
    try {
        $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = :id OR id = :prefixed OR id = :clean LIMIT 1");
        $stmt->execute([
            ':id' => $orderId,
            ':prefixed' => 'ORD-' . $cleanId,
            ':clean' => $cleanId
        ]);
        $r = $stmt->fetch();
        if ($r) {
            $items = [];
            if (!empty($r['items'])) {
                $items = json_decode($r['items'], true) ?: [];
            }
            $shippingDetails = [
                'fullName' => $r['customer_name'] ?? 'Valued Customer',
                'street' => $r['shipping_address'] ?? 'Dubai, UAE'
            ];
            $order = [
                'id' => $r['id'],
                'orderId' => $r['id'],
                'status' => $r['order_status'] ?? 'Processing',
                'customerName' => $r['customer_name'],
                'totalAmount' => (float)$r['total_amount'],
                'items' => $items,
                'shippingDetails' => $shippingDetails,
                'paymentMethod' => $r['payment_method'] ?? 'Cash on Delivery',
                'date' => date('M j, Y', strtotime($r['created_at']))
            ];
            echo json_encode(['success' => true, 'order' => $order]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found']);
        }
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 7. POST /api/orders (Cash on Delivery checkout)
if ($method === 'POST' && preg_match('#^/api/orders/?$#', $path)) {
    $body = json_decode($input, true) ?: [];
    try {
        $orderId = !empty($body['orderId']) ? $body['orderId'] : 'ORD-' . strtoupper(substr(uniqid(), -6));
        $custName = $body['customerName'] ?? ($body['shippingDetails']['fullName'] ?? 'Customer');
        $custEmail = $body['customerEmail'] ?? ($body['shippingDetails']['email'] ?? '');
        $custPhone = $body['customerPhone'] ?? ($body['shippingDetails']['phone'] ?? '');
        $shippingAddress = is_string($body['shippingAddress'] ?? null)
            ? $body['shippingAddress']
            : ($body['shippingDetails']['street'] ?? 'Dubai, UAE');
        $items = !empty($body['items']) ? json_encode($body['items']) : '[]';
        $totalAmount = (float)($body['totalAmount'] ?? ($body['totals']['total'] ?? 0));
        $payMethod = is_string($body['paymentMethod'] ?? null) ? $body['paymentMethod'] : 'Cash on Delivery';
        $orderStatus = 'Processing';
        $paymentStatus = $payMethod === 'Cash on Delivery' ? 'Pending (Pay upon arrival)' : 'Pending';

        $stmt = $pdo->prepare("
            INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, currency, payment_method, payment_status, order_status)
            VALUES (:id, :user_id, :customer_name, :customer_email, :customer_phone, :shipping_address, :items, :total_amount, 'AED', :payment_method, :payment_status, :order_status)
        ");
        $stmt->execute([
            ':id' => $orderId,
            ':user_id' => $body['userId'] ?? null,
            ':customer_name' => $custName,
            ':customer_email' => $custEmail,
            ':customer_phone' => $custPhone,
            ':shipping_address' => $shippingAddress,
            ':items' => $items,
            ':total_amount' => $totalAmount,
            ':payment_method' => $payMethod,
            ':payment_status' => $paymentStatus,
            ':order_status' => $orderStatus
        ]);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'order' => [
                'orderId' => $orderId,
                'id' => $orderId
            ]
        ]);
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 8. PUT /api/orders/:id/status (Super Admin update order status)
if (($method === 'PUT' || $method === 'PATCH') && preg_match('#^/api/orders/([^/]+)/status/?$#', $path, $matches)) {
    if (!is_admin_user(current_user($pdo))) deny(403, 'You do not have permission to do this.');
    $orderId = urldecode($matches[1]);
    $cleanId = preg_replace('/^ORD-/i', '', $orderId);
    $body = json_decode($input, true) ?: [];
    $status = $body['status'] ?? 'Processing';
    try {
        $stmt = $pdo->prepare("UPDATE orders SET order_status = :status WHERE id = :id OR id = :prefixed OR id = :clean");
        $stmt->execute([
            ':status' => $status,
            ':id' => $orderId,
            ':prefixed' => 'ORD-' . $cleanId,
            ':clean' => $cleanId
        ]);
        echo json_encode(['success' => true, 'message' => 'Order status updated to ' . (string)$status]);
        exit;
    } catch (Exception $e) {
        server_error($e);
    }
}

// 7. GET /api/health
if ($method === 'GET' && preg_match('#^/api/health/?$#', $path)) {
    echo json_encode(['status' => 'ok', 'mode' => 'php_pdo_fallback', 'database' => 'connected']);
    exit;
}

// Default Fallback Response
http_response_code(502);
echo json_encode([
    'success' => false,
    'message' => 'Node.js backend is starting up. Please reload.',
    'path' => $path
]);
