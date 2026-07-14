$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$packsRoot = Join-Path $PSScriptRoot "..\src\assets\packs"
$baseKinds = @(
  @{ Folder = "filters"; Prefix = "Filtro"; Items = @("brillo") },
  @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("hola") },
  @{ Folder = "stamps"; Prefix = "Sello"; Items = @("hoy") },
  @{ Folder = "masks"; Prefix = "Mascara"; Items = @("gafas") },
  @{ Folder = "effects"; Prefix = "Efecto"; Items = @("confeti") }
)
$packKinds = @{
  animalesDivertidos = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("selva", "sabana", "peluche", "huellas", "atardecer") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("grr", "miau", "rugido", "salto", "amigo") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("explorador", "zarpas", "salvaje", "tierno", "bestial") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("orejas", "bigotes", "melena", "hocico", "antenas") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("huellas", "hojas", "plumas", "burbujas", "saltos") }
  )
  artePintura = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("acuarela", "oleo", "pastel", "lienzo", "galeria") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("arte", "bravo", "museo", "color", "obra") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("artista", "obra", "firma", "paleta", "genio") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("boina", "pincel", "bigote", "marco", "gafas") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("pintura", "salpicon", "trazos", "brillos", "gotas") }
  )
  aventuraPirata = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("mapa", "tesoro", "bruma", "isla", "ocaso") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("ahoy", "tesoro", "a-bordo", "rumbo", "capitan") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("pirata", "botin", "brujula", "barco", "oro") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("parche", "sombrero", "catalejo", "panuelo", "barba") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("monedas", "olas", "mapas", "rayos", "bruma") }
  )
  baloncesto = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("cancha", "foco", "naranja", "energia", "final") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("triple", "mate", "canasta", "equipo", "vamos") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("mvp", "triple", "canasta", "defensa", "victoria") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("cinta", "aro", "gorra", "estrella", "balon") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("botes", "red", "chispas", "velocidad", "publico") }
  )
  dinosaurios = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("jurasico", "volcan", "ambar", "jungla", "fosil") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("roar", "dino", "fosil", "rugido", "mega") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("trex", "fosil", "huevo", "garra", "jurasic") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("crestas", "colmillos", "casco", "garra", "hocico") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("lava", "hojas", "huesos", "polvo", "meteorito") }
  )
  dulcePasteleria = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("fresa", "vainilla", "azucar", "choco", "glaseado") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("nyam", "dulce", "tarta", "rico", "choco") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("chef", "cupcake", "tarta", "dulce", "delicia") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("gorro", "fresa", "nata", "donut", "lazo") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("sprinkles", "azucar", "corazones", "gotas", "confeti") }
  )
  escuelaMagia = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("hechizo", "luna", "pergamino", "misterio", "aura") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("abracad", "magia", "pocion", "hechizo", "vuela") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("mago", "varita", "pocion", "libro", "encanto") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("sombrero", "luna", "gafas", "estrella", "capa") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("chispas", "runas", "polvo", "estrellas", "aura") }
  )
  espacio = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("orbita", "nebula", "cosmos", "luna", "galaxia") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("zoom", "orbita", "despega", "marte", "cosmos") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("astro", "cohete", "luna", "planeta", "estrella") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("casco", "visor", "antena", "estrella", "luna") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("estrellas", "orbitas", "meteoritos", "nebulosa", "cohetes") }
  )
  futbol = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("cesped", "estadio", "foco", "verde", "final") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("gol", "vamos", "equipo", "crack", "paradon") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("golazo", "crack", "copa", "equipo", "campeon") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("bufanda", "copa", "balon", "banda", "estrella") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("red", "confeti", "cesped", "estadio", "rayos") }
  )
  reinoMagico = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("cuento", "castillo", "rosa", "bosque", "corona") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("reino", "brilla", "cuento", "corona", "hadas") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("principe", "corona", "castillo", "hada", "joya") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("corona", "tiara", "capa", "joya", "alas") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("hadas", "brillos", "flores", "joyas", "polvo") }
  )
  superVelocidad = @(
    @{ Folder = "filters"; Prefix = "Filtro"; Items = @("turbo", "neon", "asfalto", "rayo", "nitro") },
    @{ Folder = "speech-bubbles"; Prefix = "Bocadillo"; Items = @("turbo", "rapido", "nitro", "meta", "zoom") },
    @{ Folder = "stamps"; Prefix = "Sello"; Items = @("rayo", "turbo", "record", "meta", "nitro") },
    @{ Folder = "masks"; Prefix = "Mascara"; Items = @("visor", "casco", "rayo", "gafas", "llama") },
    @{ Folder = "effects"; Prefix = "Efecto"; Items = @("rayos", "humo", "neon", "chispas", "turbo") }
  )
}

function New-SvgAsset {
  param(
    [string] $Path,
    [string] $Title,
    [string] $Kind,
    [string] $Hue,
    [bool] $Animated
  )

  $motion = if ($Animated) {
    '<animateTransform attributeName="transform" attributeType="XML" type="rotate" from="-3 256 256" to="3 256 256" dur="1.6s" repeatCount="indefinite" additive="sum" />'
  } else {
    ''
  }

  $filterVariant = [IO.Path]::GetFileNameWithoutExtension($Path)
  $shortTitle = ($filterVariant -replace "-", " ").ToUpperInvariant()
  if ($shortTitle.Length -gt 8) {
    $shortTitle = $shortTitle.Substring(0, 8)
  }

  $shape = switch ($Kind) {
    "filters" {
      switch ($filterVariant) {
        "calido" { '<rect width="512" height="512" fill="hsl(34 96% 58%)" opacity=".22"/><circle cx="86" cy="72" r="108" fill="#fff0b8" opacity=".18"/>' }
        "comic" { '<rect width="512" height="512" fill="hsl(205 90% 45%)" opacity=".16"/><path d="M0 64h512M0 160h512M0 256h512M0 352h512M0 448h512" stroke="#fff" stroke-width="10" opacity=".16"/><path d="M64 0v512M160 0v512M256 0v512M352 0v512M448 0v512" stroke="#111" stroke-width="6" opacity=".08"/>' }
        "suave" { '<rect width="512" height="512" fill="#fff" opacity=".18"/><circle cx="160" cy="180" r="154" fill="hsl(320 90% 80%)" opacity=".20"/><circle cx="360" cy="340" r="172" fill="hsl(180 80% 76%)" opacity=".16"/>' }
        "noche" { '<rect width="512" height="512" fill="hsl(245 76% 20%)" opacity=".32"/><circle cx="390" cy="110" r="52" fill="#fff6bf" opacity=".24"/><path d="M80 112l8 18 20 2-15 13 5 20-18-10-18 10 5-20-15-13 20-2 8-18z" fill="#fff" opacity=".24"/>' }
        default { '<rect width="512" height="512" fill="url(#grad)" opacity=".18"/><circle cx="148" cy="130" r="96" fill="#fff" opacity=".20"/><circle cx="382" cy="360" r="126" fill="#fff" opacity=".12"/>' }
      }
    }
    "speech-bubbles" {
      '<path d="M78 132c0-44 36-80 80-80h196c44 0 80 36 80 80v104c0 44-36 80-80 80H242l-88 92 20-92h-16c-44 0-80-36-80-80V132z" fill="#fff" opacity=".86" stroke="url(#grad)" stroke-width="20" stroke-linejoin="round"/><text x="256" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="900" fill="hsl(' + $Hue + ' 72% 36%)">' + $shortTitle.ToUpperInvariant() + '</text>'
    }
    "stamps" {
      '<g opacity=".92"><path d="M256 54l38 42 55-13 16 55 55 16-13 55 42 38-42 38 13 55-55 16-16 55-55-13-38 42-38-42-55 13-16-55-55-16 13-55-42-38 42-38-13-55 55-16 16-55 55 13 38-42z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="256" cy="256" r="112" fill="none" stroke="#fff" stroke-width="12" opacity=".8"/><text x="256" y="276" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="900" fill="#fff">' + $shortTitle.ToUpperInvariant() + '</text></g>'
    }
    "masks" {
      switch ($filterVariant) {
        "gafas" { '<g opacity=".96"><rect x="92" y="188" width="126" height="82" rx="30" fill="none" stroke="url(#grad)" stroke-width="24"/><rect x="294" y="188" width="126" height="82" rx="30" fill="none" stroke="url(#grad)" stroke-width="24"/><path d="M218 224h76M64 208l34 18M448 208l-34 18" stroke="url(#grad)" stroke-width="22" stroke-linecap="round"/></g>' }
        "corona" { '<path d="M96 330l34-176 82 86 44-128 44 128 82-86 34 176H96z" fill="url(#grad)" opacity=".92" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><circle cx="130" cy="154" r="24" fill="#fff"/><circle cx="256" cy="112" r="24" fill="#fff"/><circle cx="382" cy="154" r="24" fill="#fff"/>' }
        "casco" { '<path d="M104 274c10-106 74-172 152-172s142 66 152 172v70H104v-70z" fill="url(#grad)" opacity=".86" stroke="#fff" stroke-width="14"/><path d="M112 272h288" stroke="#fff" stroke-width="18" opacity=".75"/>' }
        "estrella" { '<path d="M256 64l48 132 140 6-110 86 38 136-116-78-116 78 38-136-110-86 140-6 48-132z" fill="none" stroke="url(#grad)" stroke-width="28" stroke-linejoin="round" opacity=".95"/>' }
        default { '<path d="M152 256c28 42 180 42 208 0" fill="none" stroke="url(#grad)" stroke-width="28" stroke-linecap="round"/><circle cx="186" cy="206" r="20" fill="url(#grad)"/><circle cx="326" cy="206" r="20" fill="url(#grad)"/>' }
      }
    }
    default {
      '<g transform-origin="256 256">' + $motion + '<circle cx="96" cy="120" r="22" fill="url(#grad)" opacity=".82"/><circle cx="402" cy="154" r="18" fill="#fff" opacity=".72"/><circle cx="350" cy="372" r="26" fill="url(#grad)" opacity=".62"/><path d="M256 72l28 112 106-42-62 101 102 54-119 10 18 117-73-94-73 94 18-117-119-10 102-54-62-101 106 42 28-112z" fill="url(#grad)" opacity=".78" stroke="#fff" stroke-width="12" stroke-linejoin="round"/></g>'
    }
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
  $kinds = if ($pack.Name -eq "base") { $baseKinds } elseif ($packKinds.ContainsKey($pack.Name)) { $packKinds[$pack.Name] } else { $baseKinds }
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
