$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$src = Join-Path $PSScriptRoot 'src'
$dist = Join-Path $PSScriptRoot 'dist'
[IO.Directory]::CreateDirectory($dist) | Out-Null
$package = Join-Path $dist 'Fluid-for-YouTube.zip'
$temp = Join-Path $dist ([IO.Path]::GetRandomFileName())
try {
    $zip = [IO.Compression.ZipFile]::Open($temp, 'Create')
    try {
        foreach ($file in Get-ChildItem -LiteralPath $src -File -Recurse | Sort-Object FullName) {
            $entry = $file.FullName.Substring($src.Length + 1).Replace('\', '/')
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entry) | Out-Null
        }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $PSScriptRoot 'LICENSE'), 'LICENSE') | Out-Null
    } finally {
        $zip.Dispose()
    }
    Move-Item -LiteralPath $temp -Destination $package -Force
    Write-Output $package
} finally {
    if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp }
}
