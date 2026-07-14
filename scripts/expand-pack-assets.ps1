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
    [string] $PackName,
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

  $themedMarkMatches = switch -Regex ($filterVariant) {
    "^copa$|^campeon$|^victoria$|^trofeo" {
      '<g opacity=".94"><path d="M178 118h156v70c0 70-34 118-78 118s-78-48-78-118v-70z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M178 150h-58c2 70 30 112 82 122M334 150h58c-2 70-30 112-82 122M256 306v66M198 404h116" fill="none" stroke="url(#grad)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M216 178h80M226 222h60" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".8"/></g>'
    }
    "^red$|^porteria$|^canasta$" {
      if ($PackName -eq "baloncesto") {
        '<g opacity=".94"><path d="M148 130h216v110H148z" fill="none" stroke="url(#grad)" stroke-width="22" stroke-linejoin="round"/><path d="M166 240h180l-28 138H194l-28-138zM194 240v138M238 240v138M282 240v138M326 240v138M180 286h152M174 330h164" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="12" stroke-linecap="round"/></g>'
      } else {
        '<g opacity=".94"><path d="M92 142h328v230H92z" fill="none" stroke="url(#grad)" stroke-width="24" stroke-linejoin="round"/><path d="M132 142v230M172 142v230M212 142v230M252 142v230M292 142v230M332 142v230M372 142v230M92 188h328M92 234h328M92 280h328M92 326h328" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="8" opacity=".72"/></g>'
      }
    }
    "^cesped$|^verde$|^cancha$|^campo$" {
      '<g opacity=".94"><path d="M96 144h320v224H96z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M256 144v224M96 256h320M164 206c34 26 150 26 184 0M164 306c34-26 150-26 184 0M116 374l24-52 24 52 24-52 24 52 24-52 24 52 24-52 24 52 24-52 24 52" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".75"/></g>'
    }
    "^estadio$|^publico$|^gradas$|^foco$|^final$" {
      '<g opacity=".94"><path d="M92 304c28-92 300-92 328 0v72H92v-72z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M126 292c84-48 176-48 260 0M152 236h208M180 188h152M118 350h276" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="16" stroke-linecap="round"/><circle cx="156" cy="218" r="12" fill="#fff"/><circle cx="214" cy="204" r="12" fill="#fff"/><circle cx="272" cy="204" r="12" fill="#fff"/><circle cx="330" cy="218" r="12" fill="#fff"/></g>'
    }
    "^bufanda$|^banda$|^cinta$" {
      '<g opacity=".94"><path d="M92 204c108-58 220-58 328 0l-34 82c-84-44-176-44-260 0l-34-82z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M142 182l-28 114M208 154l-18 110M276 154l18 110M342 182l28 114M126 286l-24 86M386 286l24 86" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="16" stroke-linecap="round"/></g>'
    }
    "^monedas$|^oro$|^botin$|^tesoro$" {
      '<g opacity=".94"><circle cx="196" cy="204" r="64" fill="url(#grad)" stroke="#fff" stroke-width="16"/><circle cx="286" cy="254" r="70" fill="url(#grad)" stroke="#fff" stroke-width="16"/><circle cx="204" cy="320" r="54" fill="url(#grad)" stroke="#fff" stroke-width="14"/><path d="M196 170v68M174 204h44M286 216v76M260 254h52M204 292v54M184 320h40" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="14" stroke-linecap="round"/></g>'
    }
    "^olas$|^bruma$|^ocaso$|^isla$" {
      '<g opacity=".94"><path d="M88 326c58-52 116-52 174 0s116 52 174 0M88 258c58-52 116-52 174 0s116 52 174 0" fill="none" stroke="url(#grad)" stroke-width="28" stroke-linecap="round"/><path d="M298 114l34 70h76l-62 44 24 74-72-46-72 46 24-74-62-44h76l34-70z" fill="url(#grad)" stroke="#fff" stroke-width="12" stroke-linejoin="round"/></g>'
    }
    "^mapa$|^mapas$|^pergamino$" {
      '<g opacity=".94"><path d="M112 132l92 36 104-36 92 36v224l-92-36-104 36-92-36V132z" fill="#fff" opacity=".9" stroke="url(#grad)" stroke-width="16" stroke-linejoin="round"/><path d="M204 168v224M308 132v224M154 230c50-24 92-12 126 36s72 56 116 24M164 314l48-30 34 42 70-86" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></g>'
    }
    "^brujula$|^rumbo$" {
      '<g opacity=".94"><circle cx="256" cy="256" r="138" fill="#fff" opacity=".9" stroke="url(#grad)" stroke-width="18"/><path d="M256 118v48M256 346v48M118 256h48M346 256h48M256 164l48 118-118 48 48-118z" fill="url(#grad)" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="12" stroke-linejoin="round"/></g>'
    }
    "^catalejo$" {
      '<g opacity=".94"><path d="M108 284l210-110 58 96-222 84-46-70z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="378" cy="220" r="58" fill="#fff" opacity=".9" stroke="url(#grad)" stroke-width="18"/><path d="M146 304l46 70" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round"/></g>'
    }
    "^parche$" {
      '<g opacity=".94"><path d="M92 164c110 102 218 102 328 0M120 352c92-82 180-82 272 0" fill="none" stroke="url(#grad)" stroke-width="20" stroke-linecap="round"/><path d="M184 204c44-54 100-54 144 0 4 74-36 118-72 118s-76-44-72-118z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/></g>'
    }
    "^sombrero$" {
      '<g opacity=".94"><path d="M100 286c86 34 226 34 312 0l-34 62H134l-34-62zM178 270c12-82 42-132 78-132s66 50 78 132H178z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M198 238h116" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round"/></g>'
    }
    "^barco$" {
      '<g opacity=".94"><path d="M128 304h256l-48 76H176l-48-76z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M256 108v196M256 130l110 72-110 54V130zM256 154l-98 60 98 42" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></g>'
    }
    "^planeta$|^marte$" {
      '<g opacity=".94"><circle cx="256" cy="250" r="96" fill="url(#grad)" stroke="#fff" stroke-width="16"/><path d="M86 286c74 54 258 18 340-72M106 252c82 34 230 8 322-58" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round" opacity=".85"/></g>'
    }
    "^luna$" {
      '<g opacity=".94"><path d="M318 92c-62 22-106 82-106 152s44 130 106 152c-20 8-42 12-66 12-92 0-166-74-166-166S160 76 252 76c24 0 46 4 66 16z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="314" cy="210" r="18" fill="#fff" opacity=".75"/><circle cx="278" cy="292" r="14" fill="#fff" opacity=".65"/></g>'
    }
    "^meteorito|^meteoritos$" {
      '<g opacity=".94"><path d="M104 124c96 24 160 76 192 156M154 84c104 52 160 112 168 182M88 200c74 6 132 34 174 84" fill="none" stroke="url(#grad)" stroke-width="24" stroke-linecap="round"/><path d="M300 250l78 34-34 78-78-34 34-78z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/></g>'
    }
    "^huevo$" {
      '<g opacity=".94"><path d="M256 96c76 72 116 144 116 212 0 74-52 120-116 120s-116-46-116-120c0-68 40-140 116-212z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M178 292l38-36 38 36 38-36 42 38M190 354l32-28 32 28 32-28 36 30" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/></g>'
    }
    "^donut$" {
      '<g opacity=".94"><circle cx="256" cy="256" r="128" fill="url(#grad)" stroke="#fff" stroke-width="16"/><circle cx="256" cy="256" r="48" fill="#fff" opacity=".9"/><path d="M168 214c62-42 112 36 176-8M164 306c54 42 118-28 186 12" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/><circle cx="212" cy="190" r="10" fill="hsl(' + $Hue + ' 72% 32%)"/><circle cx="326" cy="270" r="10" fill="hsl(' + $Hue + ' 72% 32%)"/></g>'
    }
    "^pincel$" {
      '<g opacity=".94"><path d="M154 360c22-74 74-82 104-48-12 62-54 94-104 48z" fill="url(#grad)" stroke="#fff" stroke-width="14"/><path d="M238 318L382 118" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="28" stroke-linecap="round"/><path d="M352 92l42 30" stroke="#fff" stroke-width="16" stroke-linecap="round"/></g>'
    }
    "balon|gol|golazo|paradon|copa|campeon|estadio|cesped|red" {
      if ($PackName -eq "futbol") {
        '<g opacity=".94"><circle cx="256" cy="236" r="86" fill="#fff" stroke="url(#grad)" stroke-width="18"/><path d="M256 174l42 30-16 50h-52l-16-50 42-30zM182 236l48 18M330 254l50-18M224 314l22-60M288 314l-22-60" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M96 344h320M118 384h276M142 344v40M202 344v40M262 344v40M322 344v40M382 344v40" stroke="url(#grad)" stroke-width="14" stroke-linecap="round" opacity=".75"/></g>'
      } else {
        '<g opacity=".94"><circle cx="256" cy="236" r="94" fill="url(#grad)" stroke="#fff" stroke-width="18"/><path d="M162 236h188M256 142c-42 54-42 134 0 188M256 142c42 54 42 134 0 188M188 172c46 34 90 34 136 0M188 300c46-34 90-34 136 0" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".85"/><path d="M346 170h68v122h-68M346 196h44v70h-44" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></g>'
      }
    }
    "aro|canasta|mate|mvp|defensa|publico|triple|botes" {
      '<g opacity=".94"><circle cx="214" cy="236" r="78" fill="url(#grad)" stroke="#fff" stroke-width="16"/><path d="M136 236h156M214 158c-36 46-36 110 0 156M214 158c36 46 36 110 0 156M154 184c38 26 82 26 120 0M154 288c38-26 82-26 120 0" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".85"/><path d="M314 168h86v96h-86v-96zM322 264l30 78M390 264l-30 78M320 304h72" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></g>'
    }
    "parche|pirata|sombrero|catalejo|panuelo|barba|barco|botin|brujula|oro|monedas|olas|mapa|mapas|tesoro|rumbo|capitan|ahoy|a-bordo|bruma" {
      '<g opacity=".94"><path d="M116 214c32-64 92-98 162-82 56 13 93 54 120 104-50 32-102 42-156 26-42-12-82-26-126-48z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="210" cy="210" r="42" fill="hsl(' + $Hue + ' 72% 30%)" stroke="#fff" stroke-width="12"/><path d="M302 164l52-38 14 42 46 4-40 30 14 46-48-20-38 32 4-50-42-22 38-24zM116 342c56-36 112-36 168 0s112 36 168 0" fill="none" stroke="url(#grad)" stroke-width="22" stroke-linecap="round"/></g>'
    }
    "cohete|cohetes|astro|orbita|orbitas|planeta|marte|cosmos|galaxia|nebula|nebulosa|meteorito|meteoritos|despega|casco|visor|antena" {
      '<g opacity=".94"><path d="M276 78c58 44 84 114 72 196l-64 24-70-70 24-64c8-28 20-56 38-86z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="292" cy="172" r="34" fill="#fff" opacity=".9"/><path d="M222 230l-74 36 54 54 36-74M172 342c52-24 114-24 168 0M86 146c58-30 124-38 192-20M350 376c44-36 70-82 76-140" fill="none" stroke="url(#grad)" stroke-width="20" stroke-linecap="round" opacity=".7"/></g>'
    }
    "estrella|estrellas|brillos|brilla|hada|hadas|corona|tiara|castillo|reino|principe|joya|joyas|alas|cuento|flores|bosque|rosa" {
      '<g opacity=".94"><path d="M256 68l44 120 128 6-100 78 34 126-106-72-106 72 34-126-100-78 128-6 44-120z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M108 348c52-68 104-68 156 0s104 68 156 0M176 150l18 38 42 5-31 28 8 42-37-20-37 20 8-42-31-28 42-5 18-38z" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/></g>'
    }
    "varita|magia|mago|hechizo|encanto|pocion|runas|pergamino|luna|vuela|abracad|aura|polvo|misterio|sombrero|capa|libro|chispas" {
      '<g opacity=".94"><path d="M120 374l198-198" stroke="url(#grad)" stroke-width="28" stroke-linecap="round"/><path d="M306 76l28 62 68 8-50 46 14 68-60-34-60 34 14-68-50-46 68-8 28-62z" fill="url(#grad)" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><path d="M136 134l24 24M86 238h46M382 330l32 32M382 114h44" stroke="url(#grad)" stroke-width="18" stroke-linecap="round"/></g>'
    }
    "trex|dino|jurasico|jurasic|fosil|huevo|garra|crestas|colmillos|hocico|lava|volcan|ambar|rugido|roar|mega|huesos" {
      '<g opacity=".94"><path d="M104 270c28-86 88-134 170-134 70 0 116 36 134 100-54-26-92-18-116 24 34 8 58 28 72 60-72 2-132-16-180-54l-36 62-44-58z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="308" cy="204" r="14" fill="#fff"/><path d="M126 356h236M170 356l-30 48M250 356l-16 48M330 356l28 48" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="18" stroke-linecap="round"/></g>'
    }
    "gorro|chef|cupcake|tarta|dulce|delicia|donut|fresa|nata|lazo|azucar|choco|vainilla|glaseado|sprinkles|corazones|rico|nyam" {
      '<g opacity=".94"><path d="M156 220c8-62 52-108 100-108s92 46 100 108l-30 154H186l-30-154z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M166 226h180M194 286h124M206 338h100" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".75"/><circle cx="206" cy="170" r="22" fill="#fff"/><circle cx="256" cy="150" r="26" fill="#fff"/><circle cx="306" cy="170" r="22" fill="#fff"/></g>'
    }
    "acuarela|oleo|pastel|lienzo|galeria|arte|artista|obra|firma|paleta|pintura|salpicon|trazos|gotas|boina|pincel|bigote|marco|color|museo|genio|bravo" {
      '<g opacity=".94"><path d="M126 158c62-54 168-54 230 0 48 42 36 106-34 100h-28c-22 0-34 18-24 38 16 32-12 62-58 50-92-24-136-122-86-188z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><circle cx="180" cy="196" r="20" fill="#fff"/><circle cx="238" cy="168" r="18" fill="#fff" opacity=".85"/><circle cx="300" cy="198" r="18" fill="#fff" opacity=".75"/><path d="M332 318l82 82M310 340l82 82" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="20" stroke-linecap="round"/></g>'
    }
    "orejas|bigotes|melena|antenas|grr|miau|salto|amigo|explorador|zarpas|salvaje|tierno|bestial|selva|sabana|peluche|huellas|hojas|plumas|burbujas|rugido" {
      '<g opacity=".94"><circle cx="256" cy="242" r="94" fill="url(#grad)" stroke="#fff" stroke-width="16"/><path d="M184 164l-52-70 8 96M328 164l52-70-8 96" fill="url(#grad)" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><circle cx="222" cy="226" r="14" fill="#fff"/><circle cx="290" cy="226" r="14" fill="#fff"/><path d="M232 270c18 16 30 16 48 0M184 278l-64-16M188 306l-62 16M328 278l64-16M324 306l62 16" fill="none" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="14" stroke-linecap="round"/></g>'
    }
    "turbo|rapido|nitro|meta|record|rayo|rayos|humo|neon|asfalto|velocidad|llama|visor|zoom" {
      '<g opacity=".94"><path d="M292 66L120 286h116l-32 160 188-244H270l22-136z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><path d="M78 350h172M104 402h126M322 114h86M342 166h64" stroke="hsl(' + $Hue + ' 72% 32%)" stroke-width="20" stroke-linecap="round" opacity=".8"/></g>'
    }
    default {
      '<g opacity=".94"><path d="M256 72l28 112 106-42-62 101 102 54-119 10 18 117-73-94-73 94 18-117-119-10 102-54-62-101 106 42 28-112z" fill="url(#grad)" opacity=".88" stroke="#fff" stroke-width="12" stroke-linejoin="round"/></g>'
    }
  }
  $themedMark = if ($themedMarkMatches -is [array]) { $themedMarkMatches[0] } else { $themedMarkMatches }

  $shape = switch ($Kind) {
    "filters" {
      switch ($filterVariant) {
        "calido" { '<rect width="512" height="512" fill="hsl(34 96% 58%)" opacity=".22"/><circle cx="86" cy="72" r="108" fill="#fff0b8" opacity=".18"/>' }
        "comic" { '<rect width="512" height="512" fill="hsl(205 90% 45%)" opacity=".16"/><path d="M0 64h512M0 160h512M0 256h512M0 352h512M0 448h512" stroke="#fff" stroke-width="10" opacity=".16"/><path d="M64 0v512M160 0v512M256 0v512M352 0v512M448 0v512" stroke="#111" stroke-width="6" opacity=".08"/>' }
        "suave" { '<rect width="512" height="512" fill="#fff" opacity=".18"/><circle cx="160" cy="180" r="154" fill="hsl(320 90% 80%)" opacity=".20"/><circle cx="360" cy="340" r="172" fill="hsl(180 80% 76%)" opacity=".16"/>' }
        "noche" { '<rect width="512" height="512" fill="hsl(245 76% 20%)" opacity=".32"/><circle cx="390" cy="110" r="52" fill="#fff6bf" opacity=".24"/><path d="M80 112l8 18 20 2-15 13 5 20-18-10-18 10 5-20-15-13 20-2 8-18z" fill="#fff" opacity=".24"/>' }
        default { '<rect width="512" height="512" fill="url(#grad)" opacity=".13"/><g transform="translate(62 52) scale(.76)" opacity=".18">' + $themedMark + '</g><circle cx="148" cy="130" r="96" fill="#fff" opacity=".12"/><circle cx="382" cy="360" r="126" fill="#fff" opacity=".10"/>' }
      }
    }
    "speech-bubbles" {
      '<g transform="translate(48 34) scale(.28)" opacity=".92">' + $themedMark + '</g><path d="M78 132c0-44 36-80 80-80h196c44 0 80 36 80 80v104c0 44-36 80-80 80H242l-88 92 20-92h-16c-44 0-80-36-80-80V132z" fill="#fff" opacity=".86" stroke="url(#grad)" stroke-width="20" stroke-linejoin="round"/><text x="256" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="900" fill="hsl(' + $Hue + ' 72% 36%)">' + $shortTitle.ToUpperInvariant() + '</text>'
    }
    "stamps" {
      '<g opacity=".92"><path d="M256 54l38 42 55-13 16 55 55 16-13 55 42 38-42 38 13 55-55 16-16 55-55-13-38 42-38-42-55 13-16-55-55-16 13-55-42-38 42-38-13-55 55-16 16-55 55 13 38-42z" fill="url(#grad)" stroke="#fff" stroke-width="16" stroke-linejoin="round"/><g transform="translate(168 104) scale(.34)" opacity=".98">' + $themedMark + '</g><text x="256" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="900" fill="#fff">' + $shortTitle.ToUpperInvariant() + '</text></g>'
    }
    "masks" {
      switch ($filterVariant) {
        "gafas" { '<g opacity=".96"><rect x="92" y="188" width="126" height="82" rx="30" fill="none" stroke="url(#grad)" stroke-width="24"/><rect x="294" y="188" width="126" height="82" rx="30" fill="none" stroke="url(#grad)" stroke-width="24"/><path d="M218 224h76M64 208l34 18M448 208l-34 18" stroke="url(#grad)" stroke-width="22" stroke-linecap="round"/></g>' }
        "corona" { '<path d="M96 330l34-176 82 86 44-128 44 128 82-86 34 176H96z" fill="url(#grad)" opacity=".92" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><circle cx="130" cy="154" r="24" fill="#fff"/><circle cx="256" cy="112" r="24" fill="#fff"/><circle cx="382" cy="154" r="24" fill="#fff"/>' }
        "casco" { '<path d="M104 274c10-106 74-172 152-172s142 66 152 172v70H104v-70z" fill="url(#grad)" opacity=".86" stroke="#fff" stroke-width="14"/><path d="M112 272h288" stroke="#fff" stroke-width="18" opacity=".75"/>' }
        "estrella" { '<path d="M256 64l48 132 140 6-110 86 38 136-116-78-116 78 38-136-110-86 140-6 48-132z" fill="none" stroke="url(#grad)" stroke-width="28" stroke-linejoin="round" opacity=".95"/>' }
        default { $themedMark }
      }
    }
    default {
      '<g transform-origin="256 256">' + $motion + '<circle cx="96" cy="120" r="22" fill="url(#grad)" opacity=".62"/><circle cx="402" cy="154" r="18" fill="#fff" opacity=".72"/><circle cx="350" cy="372" r="26" fill="url(#grad)" opacity=".52"/>' + $themedMark + '</g>'
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
New-SvgAsset -Path (Join-Path $baseStickerDir "arcoiris.svg") -Title "Arco" -Kind "stamps" -Hue "205" -PackName "base" -Animated $false
New-SvgAsset -Path (Join-Path $baseStickerDir "sol.svg") -Title "Sol" -Kind "effects" -Hue "42" -PackName "base" -Animated $false

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
      New-SvgAsset -Path $path -Title $title -Kind $kind.Folder -Hue ([string]$hue) -PackName $pack.Name -Animated ($kind.Folder -eq "effects")
    }
  }
}
