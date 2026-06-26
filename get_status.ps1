$connectionString = "Server=DESKTOP-3AL47F6;Database=RestauranteDB;Trusted_Connection=True;TrustServerCertificate=True"
$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$connection.Open()

function Execute-Query($query) {
    $command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
    $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
    $dataset = New-Object System.Data.DataSet
    $adapter.Fill($dataset) | Out-Null
    return $dataset.Tables[0]
}

Write-Output "=== sp_ConsultarPedidosCocinaAgrupados RESULT ==="
Execute-Query "EXEC sp_ConsultarPedidosCocinaAgrupados" | Format-Table

$connection.Close()
