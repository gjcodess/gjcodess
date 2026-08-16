Add-Type -AssemblyName System.Drawing

$imagePath = "d:\PROJECTS\gjcodess\pic1.jpg"
$orig = [System.Drawing.Bitmap]::FromFile($imagePath)

# Let's inspect dimensions
$origW = $orig.Width
$origH = $orig.Height
Write-Host "Image size: $origW x $origH"

# We want to crop Glenn: head, shoulders, torso and thumbs-up
# Bounding box roughly:
# X: 100 to 2800 (or 200 to 2600)
# Y: 800 to 3900
$cropX = [int]($origW * 0.05)
$cropY = [int]($origH * 0.18)
$cropW = [int]($origW * 0.85)
$cropH = [int]($origH * 0.80)

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.DrawImage($orig, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Resize to target ASCII grid resolution
# For terminal banner left pane, ~42 rows high x 48 cols wide
$targetCols = 46
$targetRows = 42

$asciiBmp = New-Object System.Drawing.Bitmap($targetCols, $targetRows)
$g2 = [System.Drawing.Graphics]::FromImage($asciiBmp)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($cropped, 0, 0, $targetCols, $targetRows)
$g2.Dispose()

# Save a small preview to see luminance
$chars = " .:-=+*#%@"
# Or custom density: " .'`,:;clodxkO0KNWMMM"

$lines = @()
for ($y = 0; $y -lt $targetRows; $y++) {
    $line = ""
    for ($x = 0; $x -lt $targetCols; $x++) {
        $pixel = $asciiBmp.GetPixel($x, $y)
        # Background suppression:
        # Brick on left: reddish brown on extreme left
        # Pool background on upper/lower right: light grey/cyan
        # Glenn's hair: dark grey
        # Glenn's skin: light skin tone
        # Glenn's shirt: vivid magenta/red
        
        $r = $pixel.R
        $gCol = $pixel.G
        $b = $pixel.B
        
        # Calculate brightness (0 to 1)
        $brightness = $pixel.GetBrightness()
        
        # If outside silhouette (e.g. top corners or extreme right background)
        # We can check background characteristics
        $isBg = $false
        # Top-right pool / background area
        if ($y -lt 12 -and $x -gt 28) { $isBg = $true }
        if ($y -lt 6 -and $x -lt 14) { $isBg = $true }
        # Extreme top left brick
        if ($x -lt 6 -and $y -lt 20) { $isBg = $true }
        # Right edge past his arm
        if ($x -gt 38 -and $y -lt 24) { $isBg = $true }
        if ($x -gt 42) { $isBg = $true }

        if ($isBg) {
            $line += " "
        } else {
            # Map brightness to char
            # Invert so darker features (hair, glasses, shirt texture) stand out or normal
            $charIdx = [int]($brightness * ($chars.Length - 1))
            if ($charIdx -ge $chars.Length) { $charIdx = $chars.Length - 1 }
            if ($charIdx -lt 0) { $charIdx = 0 }
            $c = $chars[$charIdx]
            $line += $c
        }
    }
    $lines += $line
}

$lines | Out-File -FilePath "scratch\ascii_preview.txt" -Encoding utf8
Write-Host "ASCII preview written to scratch\ascii_preview.txt"
