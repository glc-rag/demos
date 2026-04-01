<?php
/**
 * GLC-RAG API Demo - Info Chat and Admin
 * 
 * This script demonstrates how to use the Info API endpoints:
 * - Login (JWT authentication)
 * - Info creation (POST /admin/info)
 * - Info listing (GET /admin/info)
 * - Info deletion (DELETE /admin/info/{item_id})
 * - Info query via chat with LLM (POST /chat with /info prefix)
 * 
 * Server: https://glc-rag.hu/
 * PHP Version: 7.4.33+
 * 
 * Uses curl command-line for HTTP requests since PHP's openssl is not available.
 */

// Configuration
define('BASE_URL', 'https://glc-rag.hu');
define('TENANT', 'xxxxxxxx');
define('USER', 'xxxxxxxxx');
define('PASSWORD', 'xxx');
define('CURL_PATH', 'curl'); // curl is available on Windows

/**
 * Make HTTP request using curl command line
 * 
 * @param string $method HTTP method (GET, POST, PUT, DELETE)
 * @param string $endpoint API endpoint
 * @param array|null $data Request body data
 * @param string|null $token JWT token for authentication
 * @return array Response with 'status', 'body', 'headers'
 */
function makeRequest($method, $endpoint, $data = null, $token = null) {
    $url = BASE_URL . $endpoint;
    
    // Build curl command
    $cmd = CURL_PATH . ' -s -w "\n%%HTTP_CODE%%"';
    $cmd .= ' -X ' . strtoupper($method);
    
    // Headers
    $headers = ['Content-Type: application/json'];
    if ($token !== null) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    foreach ($headers as $header) {
        $cmd .= ' -H "' . $header . '"';
    }
    
    // Body - write to temp file to avoid shell escaping issues
    if ($data !== null) {
        $jsonData = json_encode($data);
        $tempFile = tempnam(sys_get_temp_dir(), 'glc_');
        file_put_contents($tempFile, $jsonData);
        $cmd .= ' -d @"' . $tempFile . '"';
    }
    
    // Follow redirects and ignore SSL verification for testing
    $cmd .= ' -L -k';
    
    $cmd .= ' "' . $url . '"';
    
    // Execute curl command
    $output = shell_exec($cmd);
    
    // Clean up temp file if created
    if ($data !== null && isset($tempFile)) {
        @unlink($tempFile);
    }
    
    if ($output === null) {
        return [
            'status' => 0,
            'body' => null,
            'error' => 'Failed to execute curl command'
        ];
    }
    
    // Parse output - look for %HTTP_CODE% marker (Windows cmd.exe doubles %% to %)
    $httpCode = 200; // Default success since we got JSON back
    $body = $output;
    
    // Find the marker - Windows curl outputs %HTTP_CODE% (single %)
    $marker = "%HTTP_CODE%";
    $pos = strrpos($output, $marker);
    if ($pos !== false) {
        $body = trim(substr($output, 0, $pos));
        
        // Get everything after the marker
        $afterMarker = substr($output, $pos + strlen($marker));
        $afterMarker = trim($afterMarker);
        
        // If there's a number after the marker, parse it as HTTP code
        if (preg_match('/^(\d+)/', $afterMarker, $matches)) {
            $httpCode = (int)$matches[1];
        }
    } else if (strpos($output, '{"access_token"') !== false) {
        // No marker but we have JSON response with access_token - likely 200
        $body = $output;
        $httpCode = 200;
    }
    
    $decodedBody = json_decode($body, true);
    
    return [
        'status' => $httpCode,
        'body' => $decodedBody,
        'raw_body' => $body
    ];
}

/**
 * Print section header
 */
function printHeader($text) {
    echo "\n" . str_repeat('=', 60) . "\n";
    echo $text . "\n";
    echo str_repeat('=', 60) . "\n";
}

/**
 * Print response in readable format
 */
function printResponse($response) {
    echo "HTTP Status: " . $response['status'] . "\n";
    if (isset($response['error'])) {
        echo "Error: " . $response['error'] . "\n";
    }
    echo "Response:\n";
    print_r($response['body']);
}

/**
 * Step 1: Login and get JWT token
 * 
 * @return string|null JWT token or null on failure
 */
function login() {
    printHeader("Step 1: Login");
    
    $data = [
        'user_id' => USER,
        'tenant_id' => TENANT,
        'password' => PASSWORD
    ];
    
    echo "Login credentials:\n";
    echo "  Tenant ID: " . TENANT . "\n";
    echo "  User ID: " . USER . "\n";
    echo "  Password: " . PASSWORD . "\n\n";
    
    $response = makeRequest('POST', '/auth/login', $data);
    
    if ($response['status'] === 200 && isset($response['body']['access_token'])) {
        echo "Login successful!\n";
        echo "JWT Token: " . substr($response['body']['access_token'], 0, 50) . "...\n";
        return $response['body']['access_token'];
    } else {
        echo "Login failed!\n";
        printResponse($response);
        return null;
    }
}

/**
 * Step 2: Create info item
 * 
 * @param string $token JWT token
 * @param string $title Title of the info item
 * @param string $description Description
 * @param string $content Content
 * @param string $scope Scope (internal/public)
 * @return string|null Info item ID or null on failure
 */
function createInfo($token, $title, $description, $content, $scope = 'internal') {
    printHeader("Step 2: Create Info Item");
    
    $data = [
        'title' => $title,
        'description' => $description,
        'content' => $content,
        'scope' => $scope,
        'is_active' => true
    ];
    
    echo "Creating info item:\n";
    echo "  Title: " . $title . "\n";
    echo "  Description: " . $description . "\n";
    echo "  Scope: " . $scope . "\n\n";
    
    $response = makeRequest('POST', '/admin/info', $data, $token);
    
    if ($response['status'] === 200 && isset($response['body']['id'])) {
        echo "Info item created successfully!\n";
        echo "ID: " . $response['body']['id'] . "\n";
        if (isset($response['body']['message'])) {
            echo "Message: " . $response['body']['message'] . "\n";
        }
        return $response['body']['id'];
    } else {
        echo "Failed to create info item!\n";
        printResponse($response);
        return null;
    }
}

/**
 * Step 3: List info items
 * 
 * @param string $token JWT token
 * @param int $limit Number of items to return
 * @param string|null $status Filter by indexing status
 * @return array|null List of info items or null on failure
 */
function listInfo($token, $limit = 100, $status = null) {
    printHeader("Step 3: List Info Items");
    
    $endpoint = '/admin/info?limit=' . $limit;
    if ($status !== null) {
        $endpoint .= '&status=' . $status;
    }
    
    echo "Fetching info items (limit: " . $limit . ")";
    if ($status !== null) {
        echo ", status: " . $status;
    }
    echo "\n\n";
    
    $response = makeRequest('GET', $endpoint, null, $token);
    
    if ($response['status'] === 200 && isset($response['body']['items'])) {
        $items = $response['body']['items'];
        $total = $response['body']['total'] ?? count($items);
        
        echo "Found " . count($items) . " items (total: " . $total . ")\n\n";
        
        echo "Info Items:\n";
        echo str_repeat('-', 80) . "\n";
        
        foreach ($items as $item) {
            echo "ID: " . $item['id'] . "\n";
            echo "Title: " . $item['title'] . "\n";
            echo "Description: " . ($item['description'] ?? 'N/A') . "\n";
            echo "Scope: " . $item['scope'] . "\n";
            echo "Active: " . ($item['is_active'] ? 'Yes' : 'No') . "\n";
            echo "Indexing Status: " . ($item['indexing_status'] ?? 'N/A') . "\n";
            echo "Created: " . ($item['created_at'] ?? 'N/A') . "\n";
            if (isset($item['content'])) {
                $shortContent = substr($item['content'], 0, 100);
                if (strlen($item['content']) > 100) {
                    $shortContent .= '...';
                }
                echo "Content: " . $shortContent . "\n";
            }
            echo str_repeat('-', 80) . "\n";
        }
        
        return $items;
    } else {
        echo "Failed to list info items!\n";
        printResponse($response);
        return null;
    }
}

/**
 * Step 4: Delete info item
 * 
 * @param string $token JWT token
 * @param string $itemId Info item ID to delete
 * @return bool Success status
 */
function deleteInfo($token, $itemId) {
    printHeader("Step 4: Delete Info Item");
    
    echo "Deleting info item with ID: " . $itemId . "\n\n";
    
    $response = makeRequest('DELETE', '/admin/info/' . $itemId, null, $token);
    
    if ($response['status'] === 200 && isset($response['body']['message'])) {
        echo "Info item deleted successfully!\n";
        echo "Message: " . $response['body']['message'] . "\n";
        return true;
    } else {
        echo "Failed to delete info item!\n";
        printResponse($response);
        return false;
    }
}

/**
 * Step 5: Query info via chat (LLM question-answer)
 * 
 * @param string $token JWT token
 * @param string $question Question to ask about the info content
 * @param string $sessionId Session ID for the chat
 * @return array|null Chat response or null on failure
 */
function queryInfo($token, $question, $sessionId = null) {
    printHeader("Step 5: Query Info via Chat (LLM)");
    
    if ($sessionId === null) {
        $sessionId = 'demo-session-' . time();
    }
    
    // Prefix the question with /info to trigger info mode
    $text = '/info ' . $question;
    
    $data = [
        'channel' => 'internal',
        'text' => $text,
        'session_id' => $sessionId
    ];
    
    echo "Asking question about info content:\n";
    echo "  Question: " . $question . "\n";
    echo "  Session ID: " . $sessionId . "\n";
    echo "  Mode: /info (info chat)\n\n";
    
    $response = makeRequest('POST', '/chat', $data, $token);
    
    if ($response['status'] === 200 && isset($response['body'])) {
        echo "Chat response received!\n\n";
        
        $body = $response['body'];
        
        echo "Response Details:\n";
        echo str_repeat('-', 60) . "\n";
        echo "Trace ID: " . ($body['trace_id'] ?? 'N/A') . "\n";
        echo "Mode: " . ($body['mode'] ?? 'N/A') . "\n";
        echo "Status Code: " . ($body['status_code'] ?? 'N/A') . "\n";
        
        if (isset($body['text'])) {
            echo "\nAnswer:\n";
            echo $body['text'] . "\n";
        }
        
        if (isset($body['sources']) && !empty($body['sources'])) {
            echo "\nSources:\n";
            print_r($body['sources']);
        }
        
        return $body;
    } else {
        echo "Failed to query info via chat!\n";
        printResponse($response);
        return null;
    }
}

/**
 * Get single info item by ID
 * 
 * @param string $token JWT token
 * @param string $itemId Info item ID
 * @return array|null Info item or null on failure
 */
function getInfo($token, $itemId) {
    printHeader("Get Info Item Details");
    
    echo "Fetching info item with ID: " . $itemId . "\n\n";
    
    $response = makeRequest('GET', '/admin/info/' . $itemId, null, $token);
    
    if ($response['status'] === 200 && isset($response['body'])) {
        echo "Info item details:\n";
        print_r($response['body']);
        return $response['body'];
    } else {
        echo "Failed to get info item!\n";
        printResponse($response);
        return null;
    }
}

/**
 * Wait for indexing to complete
 * 
 * @param string $token JWT token
 * @param string $itemId Info item ID
 * @param int $maxWait Maximum wait time in seconds
 * @return string|null Final status or null on failure
 */
function waitForIndexing($token, $itemId, $maxWait = 60) {
    printHeader("Waiting for Indexing");
    
    echo "Waiting for indexing to complete (max " . $maxWait . " seconds)...\n\n";
    
    $startTime = time();
    $lastStatus = null;
    
    while (time() - $startTime < $maxWait) {
        $items = listInfo($token, 10, null);
        
        if ($items !== null) {
            foreach ($items as $item) {
                if ($item['id'] === $itemId) {
                    $status = $item['indexing_status'];
                    echo "Current status: " . $status . " (elapsed: " . (time() - $startTime) . "s)\n";
                    
                    if ($status === 'INDEXED') {
                        echo "\nIndexing completed!\n";
                        return $status;
                    }
                    
                    if ($status === 'FAILED') {
                        echo "\nIndexing failed!\n";
                        return $status;
                    }
                    
                    $lastStatus = $status;
                    break;
                }
            }
        }
        
        sleep(5);
    }
    
    echo "\nTimeout waiting for indexing. Last status: " . $lastStatus . "\n";
    return $lastStatus;
}

/**
 * Run the complete demo workflow
 */
function runDemo() {
    echo "\n";
    echo "************************************************************\n";
    echo "   GLC-RAG API Demo - Info Chat and Admin                  \n";
    echo "   Demonstrating Info API endpoints                        \n";
    echo "   Server: " . BASE_URL . "                        \n";
    echo "************************************************************\n";
    
    // Step 1: Login
    $token = login();
    if ($token === null) {
        echo "\nFatal Error: Could not login. Exiting.\n";
        return;
    }
    
    // Step 2: Create info item
    $infoId = createInfo(
        $token,
        'GLC-RAG Demo Info',
        'Ez egy demo info elem a GLC-RAG API teszteléséhez.',
        'Ez a tartalom a GLC-RAG rendszer info API-janak demo tartalma. ' .
        'A rendszer lehetove teszi info elemek letrehozasat, listazasat, ' .
        'szerkeszteset es torleset. Az info tartalmak indexeles utan ' .
        'a /info chat parancs hasznalataval kerdezhetok le az LLM-en keresztul. ' .
        'A demo tartalmaz magyar es angol szoveget is for testing purposes.',
        'internal'
    );
    
    if ($infoId === null) {
        echo "\nWarning: Could not create info item. Continuing with existing items...\n";
    } else {
        // Wait for indexing
        echo "\n";
        waitForIndexing($token, $infoId, 30);
    }
    
    // Step 3: List info items
    $items = listInfo($token, 100);
    
    // Step 4: If we have items, query one via chat
    if ($items !== null && count($items) > 0) {
        // Find an indexed item to query
        foreach ($items as $item) {
            if (isset($item['indexing_status']) && $item['indexing_status'] === 'INDEXED') {
                // Step 5: Query info via chat
                queryInfo($token, 'Mi ez a rendszer?');
                break;
            }
        }
    }
    
    // Cleanup: Delete created item if exists
    if ($infoId !== null) {
        echo "\n";
        $confirm = deleteInfo($token, $infoId);
        if ($confirm) {
            echo "Demo info item cleaned up.\n";
        }
    }
    
    printHeader("Demo Complete");
    echo "The GLC-RAG Info API demo has completed.\n";
    echo "You can run individual functions or modify the demo as needed.\n";
}

// Main execution
if (php_sapi_name() === 'cli' || !isset($_SERVER['REQUEST_METHOD'])) {
    runDemo();
} else {
    // Web mode - display API documentation
    echo "<html><head><title>GLC-RAG Info API Demo</title>";
    echo "<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;}";
    echo "h1{color:#333;}.endpoint{margin:20px 0;padding:15px;background:#f5f5f5;border-radius:5px;}";
    echo "code{background:#e0e0e0;padding:2px 5px;border-radius:3px;}";
    echo ".method{font-weight:bold;padding:3px 8px;border-radius:3px;}";
    echo ".get{background:#61affe;color:#fff;}.post{background:#49cc90;color:#fff;}";
    echo ".delete{background:#f93e3e;color:#fff;}</style></head><body>";
    echo "<h1>GLC-RAG Info API Demo</h1>";
    echo "<p>This is a PHP demo for the GLC-RAG Info API.</p>";
    echo "<p>Run from command line: <code>php info_demo.php</code></p>";
    echo "<h2>Available Endpoints</h2>";
    echo "<div class='endpoint'><span class='method post'>POST</span> <code>/auth/login</code> - Login to get JWT token</div>";
    echo "<div class='endpoint'><span class='method post'>POST</span> <code>/admin/info</code> - Create info item</div>";
    echo "<div class='endpoint'><span class='method get'>GET</span> <code>/admin/info</code> - List info items</div>";
    echo "<div class='endpoint'><span class='method get'>GET</span> <code>/admin/info/{id}</code> - Get single info item</div>";
    echo "<div class='endpoint'><span class='method delete'>DELETE</span> <code>/admin/info/{id}</code> - Delete info item</div>";
    echo "<div class='endpoint'><span class='method post'>POST</span> <code>/chat</code> - Query info via LLM (use /info prefix)</div>";
    echo "</body></html>";
}
?>