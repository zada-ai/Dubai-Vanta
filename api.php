<?php
// High-performance reverse proxy for Node.js API on port 5000
$nodePort = 5000;
$requestUri = $_SERVER['REQUEST_URI'];
$targetUrl = 'http://127.0.0.1:' . $nodePort . $requestUri;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

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

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Node.js backend on port 5000 is not reachable',
        'curl_error' => curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$headersStr = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);
curl_close($ch);

http_response_code($httpCode);

// Forward response headers (Content-Type, Set-Cookie, etc.)
$headers = explode("\r\n", $headersStr);
foreach ($headers as $h) {
    if (!empty($h) && !preg_match('/^Transfer-Encoding:/i', $h) && !preg_match('/^HTTP\//i', $h)) {
        header($h, false);
    }
}

echo $body;
