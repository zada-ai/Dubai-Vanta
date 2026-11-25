<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // High-performance reverse proxy with Native PHP PDO Fallback for Node.js API
    $nodePort = 5000;
    $requestUri = $_SERVER['REQUEST_URI'] ?? '/';
    $targetUrl = 'http://127.0.0.1:' . $nodePort . $requestUri;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
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

$pdo_error = null;
function get_pdo_connection() {
    global $pdo_error;
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $envFile = __DIR__ . '/.env';
    $dbHost = 'localhost';
    $dbPort = 3306;
    $dbName = 'u383896879_dubai_vanta';
    $dbUser = 'u383896879_vanta_user';
    $dbPass = 'Dubai2026Vanta@';

    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                $k = trim($k);
                $v = trim(trim($v), '"\'');
                if ($k === 'DB_HOST') $dbHost = $v;
                if ($k === 'DB_PORT') $dbPort = (int)$v;
                if ($k === 'DB_NAME') $dbName = $v;
                if ($k === 'DB_USER') $dbUser = $v;
                if ($k === 'DB_PASSWORD') $dbPass = $v;
            }
        }
    }

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
    echo json_encode([
        'success' => false,
        'message' => 'Backend database temporarily unavailable. Please retry in a few seconds.',
        'db_error' => $pdo_error ?? 'Unknown connection error'
    ]);
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

// 5. GET /api/orders (List all orders for Super Admin & syncing)
if ($method === 'GET' && preg_match('#^/api/orders/?$#', $path)) {
    try {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
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
        $orderStatus = $body['orderStatus'] ?? 'Processing';
        $paymentStatus = $body['paymentStatus'] ?? ($payMethod === 'Cash on Delivery' ? 'Pending (Pay upon arrival)' : 'Paid');

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
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
    }
}

// 8. PUT /api/orders/:id/status (Super Admin update order status)
if (($method === 'PUT' || $method === 'PATCH') && preg_match('#^/api/orders/([^/]+)/status/?$#', $path, $matches)) {
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
        echo json_encode(['success' => true, 'message' => "Order status updated to {$status}"]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        exit;
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
