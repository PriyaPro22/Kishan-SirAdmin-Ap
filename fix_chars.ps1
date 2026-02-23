$path = "d:\BIJLI WALA AYA V2 DATE 13\app\booking-summary\page.tsx"
$content = [System.IO.File]::ReadAllText($path)
Write-Host "File length: $($content.Length)"

# Define the mangled strings directly
$mangledRupee = 'â‚¹'
$mangledMult = 'Ã—'

if ($content.Contains($mangledRupee)) {
    Write-Host "Found mangled Rupee symbol. Replacing..."
    $content = $content.Replace($mangledRupee, '₹')
} else {
    Write-Host "Mangled Rupee symbol not found."
}

if ($content.Contains($mangledMult)) {
    Write-Host "Found mangled Multiplication symbol. Replacing..."
    $content = $content.Replace($mangledMult, '×')
} else {
    Write-Host "Mangled Multiplication symbol not found."
}

# Save as UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Done."
