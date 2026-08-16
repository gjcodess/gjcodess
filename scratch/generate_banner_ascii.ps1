Add-Type -AssemblyName System.Drawing

$imagePath = "d:\PROJECTS\gjcodess\pic1.jpg"
$orig = [System.Drawing.Bitmap]::FromFile($imagePath)

$cropX = 200
$cropY = 700
$cropW = 2600
$cropH = 3300

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($orig, 0, 0, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Grid resolution for Left Pane (38 columns x 26 rows)
$cols = 38
$rows = 25

$small = New-Object System.Drawing.Bitmap($cols, $rows)
$g2 = [System.Drawing.Graphics]::FromImage($small)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.DrawImage($cropped, 0, 0, $cols, $rows)
$g2.Dispose()

# Character densities for dark terminal background:
# High density: @, %, #, W, M
# Medium density: *, s, c, +, =
# Light density: -, :, .
$ramp = " .:-=+*sc#%@"

$lines = @()
for ($y = 0; $y -lt $rows; $y++) {
    $line = ""
    for ($x = 0; $x -lt $cols; $x++) {
        $p = $small.GetPixel($x, $y)
        $r = $p.R
        $gc = $p.G
        $b = $p.B
        $br = $p.GetBrightness()

        # Silhouette check
        $isPerson = $false
        
        # Head (y: 0..10)
        if ($y -le 10) {
            if ($x -ge 9 -and $x -le 26) {
                if (-not ($x -ge 22 -and $gc -gt 130 -and $b -gt 120)) {
                    $isPerson = $true
                }
            }
        }
        # Neck & Shoulders & Hand (y: 11..16)
        elseif ($y -le 16) {
            if ($x -ge 4 -and $x -le 33) {
                if ($x -le 6 -and $y -le 12) { $isPerson = $false }
                elseif ($x -ge 30 -and $br -gt 0.6) { $isPerson = $false }
                else { $isPerson = $true }
            }
        }
        # Chest, Shirt & Thumbs Up (y: 17..24)
        else {
            if ($x -ge 2 -and $x -le 36) {
                if ($x -le 3 -and $y -le 18) { $isPerson = $false }
                elseif ($x -ge 35 -and $br -gt 0.6) { $isPerson = $false }
                else { $isPerson = $true }
            }
        }

        if (-not $isPerson) {
            $line += " "
        } else {
            # Compute character based on feature
            # Hair (y: 0..4)
            if ($y -le 4) {
                $line += if ($br -lt 0.35) { "%" } elseif ($br -lt 0.5) { "#" } else { "*" }
            }
            # Glasses & Eyes (y: 5..6, x: 12..24)
            elseif ($y -ge 5 -and $y -le 6 -and $x -ge 12 -and $x -le 24) {
                if ($x -eq 13 -or $x -eq 17 -or $x -eq 18 -or $x -eq 23) {
                    $line += "#"
                } elseif ($br -lt 0.45) {
                    $line += "%"
                } else {
                    $line += "+"
                }
            }
            # Face / Smile (y: 7..10)
            elseif ($y -le 10) {
                if ($y -eq 8 -and ($x -eq 17 -or $x -eq 18)) { $line += "=" } # Nose
                elseif ($y -eq 9 -and $x -ge 16 -and $x -le 20) { $line += "-" } # Smile
                else {
                    $val = [int]($br * 4 + 1)
                    $line += $ramp[$val]
                }
            }
            # Thumbs Up Hand (y: 13..19, x: 4..10)
            elseif ($y -ge 13 -and $y -le 19 -and $x -ge 4 -and $x -le 10) {
                if ($y -eq 13 -and $x -eq 6) { $line += "#" } # Thumb tip
                elseif ($y -eq 14 -and ($x -ge 5 -and $x -le 7)) { $line += "%" } # Thumb
                elseif ($br -lt 0.4) { $line += "#" }
                else { $line += "*" }
            }
            # Shirt & Body (y: 11..24)
            else {
                # Buttons down center (x around 18..19)
                if (($x -eq 18 -or $x -eq 19) -and ($y -eq 12 -or $y -eq 16 -or $y -eq 20 -or $y -eq 24)) {
                    $line += "@"
                }
                # Collar (y: 11..13, x: 13..23)
                elseif ($y -ge 11 -and $y -le 13 -and ($x -eq 13 -or $x -eq 14 -or $x -eq 22 -or $x -eq 23)) {
                    $line += "#"
                }
                # Shading across shirt
                else {
                    $sVal = ($r / 255.0) * 0.6 + (1.0 - $br) * 0.4
                    $idx = [int]($sVal * 8 + 2)
                    if ($idx -ge $ramp.Length) { $idx = $ramp.Length - 1 }
                    if ($idx -lt 1) { $idx = 1 }
                    $line += $ramp[$idx]
                }
            }
        }
    }
    $lines += $line
}

$orig.Dispose()
$cropped.Dispose()
$small.Dispose()

$lines | Out-File -FilePath "scratch\ascii_final.txt" -Encoding utf8
Write-Host "ASCII rows generated: $($lines.Count)"

$linesJson = $lines | ConvertTo-Json -Compress
$linesJson | Out-File -FilePath "scratch\ascii_final.json" -Encoding utf8
