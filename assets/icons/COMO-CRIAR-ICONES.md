# Gerador de Ícones PWA

## Como Criar os Ícones Necessários

O Service Worker precisa dos seguintes ícones para funcionar corretamente:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

### Opção 1: Online (Recomendado)
1. Acesse: https://realfavicongenerator.net/
2. Faça upload do arquivo `favicon.svg` ou `favicon.png`
3. Configure as opções:
   - Android/Chrome: 192x192 e 512x512
   - Nome dos arquivos: `icon-192.png` e `icon-512.png`
4. Baixe e coloque na pasta `assets/icons/`

### Opção 2: Ferramenta Local
Se você tem ImageMagick instalado:

```bash
# A partir do favicon.png (se for grande o suficiente)
magick favicon.png -resize 192x192 icon-192.png
magick favicon.png -resize 512x512 icon-512.png
```

### Opção 3: Usando Photoshop/GIMP
1. Abra `favicon.svg` ou `favicon.png`
2. Redimensione para 192x192 pixels
3. Salve como `icon-192.png`
4. Repita para 512x512 pixels → `icon-512.png`

### Opção 4: Script PowerShell (Windows)
```powershell
# Crie um arquivo create-icons.ps1 e execute:
Add-Type -AssemblyName System.Drawing

# Função para redimensionar imagem
function Resize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )
    
    $img = [System.Drawing.Image]::FromFile($InputPath)
    $newImg = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($newImg)
    $graphics.DrawImage($img, 0, 0, $Width, $Height)
    $newImg.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newImg.Dispose()
    $img.Dispose()
}

# Se favicon.png existe e é grande o suficiente
if (Test-Path "favicon.png") {
    Resize-Image -InputPath "favicon.png" -OutputPath "icon-192.png" -Width 192 -Height 192
    Resize-Image -InputPath "favicon.png" -OutputPath "icon-512.png" -Width 512 -Height 512
    Write-Host "✅ Ícones PWA criados com sucesso!"
} else {
    Write-Host "❌ favicon.png não encontrado"
}
```

## Validação
Após criar os ícones:
1. Recarregue a página com Ctrl+Shift+R
2. Abra DevTools > Application > Service Workers
3. Verifique se não há erros de paths
4. Teste a instalação PWA (ícone + na barra de endereços)