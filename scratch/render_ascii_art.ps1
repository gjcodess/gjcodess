Add-Type -AssemblyName System.Drawing

$imagePath = "d:\PROJECTS\gjcodess\pic1.jpg"
$orig = [System.Drawing.Bitmap]::FromFile($imagePath)

# Glenn in pic1.jpg:
# Image size: 3000 x 4000
# Face: ~ x: 600..2000, y: 800..2200
# Hand / Thumbs up: ~ x: 300..1000, y: 2400..3300
# Shirt: ~ x: 100..2800, y: 1800..4000

$cropX = 200
$cropY = 700
$cropW = 2600
$cropH = 3300

$targetCols = 44
$targetRows = 38

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($orig, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$small = New-Object System.Drawing.Bitmap($targetCols, $targetRows)
$g2 = [System.Drawing.Graphics]::FromImage($small)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($cropped, 0, 0, $targetCols, $targetRows)
$g2.Dispose()

# Authentic character ramp like the user's example:
# " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8&%QW#MB$@"
$ramp = "  .:-=+*s#%@"

$grid = @()

for ($y = 0; $y -lt $targetRows; $y++) {
    $line = ""
    for ($x = 0; $x -lt $targetCols; $x++) {
        $p = $small.GetPixel($x, $y)
        $r = $p.R
        $gc = $p.G
        $b = $p.B
        $br = $p.GetBrightness()

        # Foreground check
        $isPerson = $false

        # Head / Hair / Glasses (y: 0..16)
        if ($y -le 16) {
            if ($x -ge 10 -and $x -le 29) {
                # Pool background on right
                if ($x -gt 24 -and $gc -gt 130 -and $b -gt 120 -and $r -lt 160) {
                    $isPerson = $false
                } else {
                    $isPerson = $true
                }
            }
        }
        # Neck & Shirt collar & Thumbs-up hand (y: 17..24)
        elseif ($y -le 24) {
            if ($x -ge 5 -and $x -le 35) {
                if ($x -lt 8 -and $y -lt 20) { $isPerson = $false } # brick top
                elseif ($x -gt 32 -and $br -gt 0.6) { $isPerson = $false } # right bg
                else { $isPerson = $true }
            }
        }
        # Torso & Arms & Hand (y: 25..37)
        else {
            if ($x -ge 1 -and $x -le 38) {
                if ($x -le 2 -and $y -le 28) { $isPerson = $false } # brick
                elseif ($x -gt 36 -and $br -gt 0.65) { $isPerson = $false }
                else { $isPerson = $true }
            }
        }

        if (-not $isPerson) {
            $line += " "
        } else {
            # Compute detail index
            # Face region: smooth skin features, dark hair, glasses frames
            if ($y -le 16) {
                # Glasses detection (around y=6..10, x=13..27)
                $isGlasses = ($y -ge 6 -and $y -le 10 -and $br -lt 0.38)
                if ($isGlasses) {
                    $line += "%"
                } elseif ($y -le 5) { # Hair
                    $hIdx = [int]((1.0 - $br) * 7 + 2)
                    if ($hIdx -ge $ramp.Length) { $hIdx = $ramp.Length - 1 }
                    $line += $ramp[$hIdx]
                } else { # Face skin
                    $fIdx = [int]($br * 5 + 1)
                    if ($fIdx -ge $ramp.Length) { $fIdx = $ramp.Length - 1 }
                    $line += $ramp[$fIdx]
                }
            }
            # Thumbs-up Hand (x: 4..12, y: 19..28)
            elseif ($x -ge 4 -and $x -le 12 -and $y -ge 19 -and $y -le 28) {
                $handIdx = [int]($br * 6 + 2)
                if ($handIdx -ge $ramp.Length) { $handIdx = $ramp.Length - 1 }
                $line += $ramp[$handIdx]
            }
            # Shirt & Body
            else {
                # Red shirt texture - map red intensity & shading
                $shirtVal = ($r / 255.0) * 0.7 + (1.0 - $br) * 0.3
                $sIdx = [int]($shirtVal * ($ramp.Length - 2) + 1)
                if ($sIdx -ge $ramp.Length) { $sIdx = $ramp.Length - 1 }
                $line += $ramp[$sIdx]
            }
        }
    }
    $grid += $line
}

$grid | Out-File -FilePath "scratch\ascii_art_clean.txt" -Encoding utf8
$grid | ConvertTo-Json | Out-File -FilePath "scratch\ascii_art_clean.json" -Encoding utf8
Write-Host "ASCII generated with $($grid.Count) rows!"
