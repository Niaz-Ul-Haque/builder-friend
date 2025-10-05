# Script to add enhanced SEO meta tags to all HTML files

$htmlFiles = @(
    "about.html",
    "contact.html", 
    "custom-cabinetry.html",
    "exterior-hardscaping.html",
    "faqs.html",
    "flooring.html",
    "gallery.html",
    "interior-renovations.html",
    "packages.html",
    "partners.html",
    "property-maintenance.html",
    "service-areas.html",
    "services.html"
)

$basePath = "c:\Users\Niaz\Downloads\plan6ix_static_site"

foreach ($file in $htmlFiles) {
    $filePath = Join-Path $basePath $file
    Write-Host "Processing $file..."
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if manifest is already added
        if ($content -notmatch 'rel="manifest"') {
            # Add manifest link after favicon
            $content = $content -replace '(<link rel="apple-touch-icon"[^>]+>)', "`$1`n  `n  <!-- Web App Manifest -->`n  <link rel=""manifest"" href=""site.webmanifest"">`n  `n  <!-- Theme Color -->`n  <meta name=""theme-color"" content=""#c8a165"">`n  <meta name=""msapplication-TileColor"" content=""#c8a165"">`n  <meta name=""apple-mobile-web-app-capable"" content=""yes"">`n  <meta name=""apple-mobile-web-app-status-bar-style"" content=""black-translucent"">`n  `n  <!-- Humans.txt -->`n  <link type=""text/plain"" rel=""author"" href=""humans.txt"">"
        }
        
        # Check if additional SEO meta tags are already added
        if ($content -notmatch 'meta name="author"') {
            # Add additional SEO meta tags after keywords
            $content = $content -replace '(<meta name="keywords"[^>]+>)', "`$1`n  `n  <!-- Additional SEO Meta Tags -->`n  <meta name=""author"" content=""Plan6ix Buildtrade Inc"">`n  <meta name=""robots"" content=""index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"">`n  <meta name=""googlebot"" content=""index, follow"">`n  <meta name=""bingbot"" content=""index, follow"">`n  <meta name=""language"" content=""English"">`n  <meta name=""revisit-after"" content=""7 days"">`n  <meta name=""rating"" content=""General"">`n  <meta name=""distribution"" content=""Global"">`n  <meta name=""geo.region"" content=""CA-ON"">`n  <meta name=""geo.placename"" content=""Toronto, Scarborough"">`n  <meta name=""geo.position"" content=""43.7615;-79.2302"">`n  <meta name=""ICBM"" content=""43.7615, -79.2302"">"
        }
        
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Updated $file successfully" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Cyan
