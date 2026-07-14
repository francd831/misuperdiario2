$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$packsRoot = Join-Path $PSScriptRoot "..\src\assets\packs"
$paidKinds = @(
  @{ Folder = "filters"; Prefix = "Filtro"; Items = @("brillo", "calido", "comic", "suave", "noche") },
  @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("hola", "wow", "genial", "secreto", "recuerdo") },
  @{ Folder = "stamps"; Prefix = "Sello"; Items = @("hoy", "logro", "favorito", "valiente", "magico") },
  @{ Folder = "masks"; Prefix = "Mascara"; Items = @("gafas", "corona", "casco", "estrella", "sonrisa") },
  @{ Folder = "effects"; Prefix = "Efecto"; Items = @("confeti", "destellos", "ondas", "lluvia", "energia") }
)
$baseKinds = @(
  @{ Folder = "filters"; Prefix = "Filtro"; Items = @("brillo") },
  @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("hola") },
  @{ Folder = "stamps"; Prefix = "Sello"; Items = @("hoy") },
  @{ Folder = "masks"; Prefix = "Mascara"; Items = @("gafas") },
  @{ Folder = "effects"; Prefix = "Efecto"; Items = @("confeti") }
)

function New-SvgAsset {
  param(
    [string] $Path,
    [string] $Title,
    [string] $Kind,
    [string] $Hue,
    [bool] $Animated
  )

  $motion = if ($Animated) {
    '<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="-4 256 256" to="4 256 256" dur="1.4s" repeatCount="indefinite" additive="sum" />'
  } else {
    ''
  }

  $shape = switch ($Kind) {
    "filters" { '<rect x="44" y="44" width="424" height="424" rx="72" fill="url(#grad)" opacity=".72"/><circle cx="170" cy="170" r="58" fill="#fff" opacity=".32"/><circle cx="344" cy="330" r="92" fill="#fff" opacity=".18"/>' }
    "speech-bubbles" { '<path d="M84 132c0-42 34-76 76-76h192c42 0 76 34 76 76v102c0 42-34 76-76 76H238l-82 82 18-82h-14c-42 0-76-34-76-76V132z" fill="url(#grad)" stroke="#fff" stroke-width="18" stroke-linejoin="round"/>' }
    "stamps" { '<path d="M256 54l38 42 55-13 16 55 55 16-13 55 42 38-42 38 13 55-55 16-16 55-55-13-38 42-38-42-55 13-16-55-55-16 13-55-42-38 42-38-13-55 55-16 16-55 55 13 38-42z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/>' }
    "masks" { '<path d="M76 210c52-70 116-104 180-104s128 34 180 104c-22 72-64 108-126 108-30 0-48-14-54-34-6 20-24 34-54 34-62 0-104-36-126-108z" fill="url(#grad)" stroke="#fff" stroke-width="16"/><circle cx="190" cy="224" r="34" fill="#fff"/><circle cx="322" cy="224" r="34" fill="#fff"/>' }
    default { '<g transform-origin="256 256">' + $motion + '<circle cx="256" cy="256" r="84" fill="url(#grad)" opacity=".66"/><path d="M256 72l28 112 106-42-62 101 102 54-119 10 18 117-73-94-73 94 18-117-119-10 102-54-62-101 106 42 28-112z" fill="url(#grad)" stroke="#fff" stroke-width="14" stroke-linejoin="round"/></g>' }
  }

  $svg = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="$Title">
  <defs>
    <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="hsl($Hue 92% 70%)"/>
      <stop offset="100%" stop-color="hsl($Hue 72% 48%)"/>
    </linearGradient>
  </defs>
  $shape
  <text x="256" y="284" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="800" fill="#fff">$Title</text>
</svg>
"@

  Set-Content -LiteralPath $Path -Value $svg -Encoding UTF8
}

function New-PngFrame {
  param([string] $Path, [string] $Hue)

  $bitmap = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $color = [System.Drawing.ColorTranslator]::FromHtml($Hue)
  $pen = New-Object System.Drawing.Pen $color, 42
  $graphics.DrawRectangle($pen, 42, 42, 940, 940)
  $thinPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 255, 255, 255)), 12
  $graphics.DrawRectangle($thinPen, 84, 84, 856, 856)

  foreach ($point in @(@(120,120), @(904,120), @(120,904), @(904,904))) {
    $brush = New-Object System.Drawing.SolidBrush $color
    $graphics.FillEllipse($brush, $point[0] - 54, $point[1] - 54, 108, 108)
    $brush.Dispose()
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose()
  $thinPen.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

function Resize-PngToSquare1024 {
  param([string] $Path)
  $image = [System.Drawing.Image]::FromFile($Path)
  if ($image.Width -eq 1024 -and $image.Height -eq 1024) {
    $image.Dispose()
    return
  }

  $bitmap = New-Object System.Drawing.Bitmap 1024, 1024, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.DrawImage($image, 0, 0, 1024, 1024)
  $image.Dispose()
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$baseStickerDir = Join-Path $packsRoot "base\stickers"
New-SvgAsset -Path (Join-Path $baseStickerDir "arcoiris.svg") -Title "Arco" -Kind "stamps" -Hue "205" -Animated $false
New-SvgAsset -Path (Join-Path $baseStickerDir "sol.svg") -Title "Sol" -Kind "effects" -Hue "42" -Animated $false

$baseFrameDir = Join-Path $packsRoot "base\frames"
@("animales.png", "celestial.png", "dulces.png", "mariposas.png", "musica.png", "pintura.png") | ForEach-Object {
  $path = Join-Path $baseFrameDir $_
  if (Test-Path $path) {
    Remove-Item -LiteralPath $path
  }
}

New-PngFrame -Path (Join-Path $packsRoot "aventuraPirata\frames\tesoro.png") -Hue "#d99a2b"

Get-ChildItem (Join-Path $packsRoot "baloncesto\frames") -File -Filter "*.png" | ForEach-Object { Resize-PngToSquare1024 -Path $_.FullName }
Get-ChildItem (Join-Path $packsRoot "futbol\frames") -File -Filter "*.png" | ForEach-Object { Resize-PngToSquare1024 -Path $_.FullName }

Get-ChildItem $packsRoot -Directory | ForEach-Object {
  $pack = $_
  $kinds = if ($pack.Name -eq "base") { $baseKinds } else { $paidKinds }
  $packHueSeed = [Math]::Abs($pack.Name.GetHashCode()) % 320

  foreach ($kind in $kinds) {
    $folder = Join-Path $pack.FullName $kind.Folder
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
    Get-ChildItem $folder -File -ErrorAction SilentlyContinue | Remove-Item

    for ($index = 0; $index -lt $kind.Items.Count; $index++) {
      $item = $kind.Items[$index]
      $hue = ($packHueSeed + ($index * 37)) % 360
      $title = if ($pack.Name -eq "base") { $kind.Prefix } else { "$($kind.Prefix) $($index + 1)" }
      $path = Join-Path $folder "$item.svg"
      New-SvgAsset -Path $path -Title $title -Kind $kind.Folder -Hue ([string]$hue) -Animated ($kind.Folder -eq "effects")
    }
  }
}
