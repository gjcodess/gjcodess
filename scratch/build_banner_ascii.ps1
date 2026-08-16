Add-Type -AssemblyName System.Drawing

$imagePath = "d:\PROJECTS\gjcodess\pic1.jpg"
$orig = [System.Drawing.Bitmap]::FromFile($imagePath)

$origW = $orig.Width
$origH = $orig.Height

# Bounding box for Glenn:
# Head top: y=800, chin: y=1900
# Thumbs up: x=300 to 1000, y=2400 to 3400
# Body bottom: y=4000
# Right arm/shoulder: x=2800

$cropX = 200
$cropY = 750
$cropW = 2600
$cropH = 3250

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($orig, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Target ASCII grid:
# In the banner (height ~360px), we can have ~32 rows by 42 columns on the left pane!
$targetCols = 42
$targetRows = 34

$asciiBmp = New-Object System.Drawing.Bitmap($targetCols, $targetRows)
$g2 = [System.Drawing.Graphics]::FromImage($asciiBmp)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($cropped, 0, 0, $targetCols, $targetRows)
$g2.Dispose()

$charRamp = " .:-=+*#%@"
$asciiLines = @()

for ($y = 0; $y -lt $targetRows; $y++) {
    $line = ""
    for ($x = 0; $x -lt $targetCols; $x++) {
        $p = $asciiBmp.GetPixel($x, $y)
        $r = $p.R
        $gCol = $p.G
        $b = $p.B
        $br = $p.GetBrightness()

        # Silhouette segmentation:
        $isForeground = $false
        
        # Head Region (y: 0 to 14, x: 8 to 30)
        if ($y -le 14) {
            # Hair & Glasses & Face
            if ($x -ge 10 -and $x -le 28) {
                # Not pool background on the right
                if (-not ($x -ge 24 -and $br -gt 0.65 -and $b -gt 130)) {
                    $isForeground = $true
                }
            }
        }
        # Neck & Upper Torso (y: 15 to 22, x: 6 to 36)
        elseif ($y -le 22) {
            if ($x -ge 6 -and $x -le 35) {
                # Hand on the left or shirt in center/right
                $isForeground = $true
                # Remove brick on upper left
                if ($x -le 8 -and $y -le 17) { $isForeground = $false }
                # Remove background on upper right
                if ($x -ge 32 -and $br -gt 0.6) { $isForeground = $false }
            }
        }
        # Torso & Thumbs Up (y: 23 to 33, x: 2 to 40)
        else {
            if ($x -ge 2 -and $x -le 38) {
                $isForeground = $true
                # Brick on extreme left edge
                if ($x -le 3 -and $br -lt 0.3) { $isForeground = $false }
                # Background past right arm
                if ($x -ge 37) { $isForeground = $false }
            }
        }

        if (-not $isForeground) {
            $line += " "
        } else {
            # Invert brightness for dark terminal background:
            # Highlight features
            $val = 1.0 - $br
            # Contrast boost
            $val = [Math]::Pow($val, 1.2)
            $idx = [int]($val * ($charRamp.Length - 1))
            if ($idx -ge $charRamp.Length) { $idx = $charRamp.Length - 1 }
            if ($idx -lt 0) { $idx = 0 }
            $line += $charRamp[$idx]
        }
    }
    $asciiLines += $line
}

$asciiLines | Out-File -FilePath "scratch\ascii_banner.txt" -Encoding utf8
Write-Host "ASCII output written to scratch\ascii_banner.txt"

# Also write as JSON array for NodeJS
$json = $asciiLines | ConvertTo-Json
$json | Out-File -FilePath "scratch\ascii_banner.json" -Encoding utf8
