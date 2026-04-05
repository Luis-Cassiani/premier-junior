<?php
// api.php - Conector entre archivos CSV y tu página Web (Frontend)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Función para leer un archivo CSV y convertirlo a un arreglo asociativo
function csvToArray($filename) {
    if (!file_exists($filename) || !is_readable($filename)) return [];
    
    $header = null;
    $data = [];
    if (($handle = fopen($filename, 'r')) !== false) {
        // En Excel en español, el separador por defecto suele ser el punto y coma (;)
        while (($row = fgetcsv($handle, 1000, ';')) !== false) {
            if (!$header) {
                // Remover posibles caracteres invisibles del BOM (que a veces pone Excel)
                $header = array_map(function($val) {
                    return preg_replace('/[\x00-\x1F\x80-\xFF]/', '', trim($val));
                }, $row);
            } else {
                if (count($header) == count($row)) {
                    $data[] = array_combine($header, $row);
                }
            }
        }
        fclose($handle);
    }
    return $data;
}

try {
    // 1. Obtener los Equipos Activos desde equipos.csv
    $allTeams = csvToArray('equipos.csv');
    $teams = array_filter($allTeams, function($team) {
        return isset($team['active']) && trim($team['active']) == '1';
    });
    // Reindexar el array
    $teams = array_values($teams);

    // 2. Obtener los Partidos desde partidos.csv
    $matches = csvToArray('partidos.csv');

    // 3. Enviar los datos en formato JSON a tu página (app.js)
    echo json_encode([
        'status' => 'success',
        'teams' => $teams,
        'matches' => $matches
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
