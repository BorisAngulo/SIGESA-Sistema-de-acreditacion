# Configuración de Google Drive para Backups

## Pasos para configurar Google Drive

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Drive:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Drive API"
   - Haz clic en "Enable"

### 2. Crear credenciales OAuth2

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configura la pantalla de consentimiento OAuth si es necesario
4. Selecciona "Desktop application" como tipo de aplicación
5. Descarga el archivo JSON con las credenciales

### 3. Obtener Refresh Token

Ejecuta este script PHP para obtener el refresh token:

```php
<?php
require_once 'vendor/autoload.php';

$client = new Google_Client();
$client->setClientId('TU_CLIENT_ID');
$client->setClientSecret('TU_CLIENT_SECRET');
$client->setRedirectUri('urn:ietf:wg:oauth:2.0:oob');
$client->addScope(Google_Service_Drive::DRIVE_FILE);
$client->setAccessType('offline');
$client->setPrompt('select_account consent');

$authUrl = $client->createAuthUrl();
echo "Visita esta URL en tu navegador:\n" . $authUrl . "\n\n";
echo "Ingresa el código de autorización: ";
$authCode = trim(fgets(STDIN));

$accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
$client->setAccessToken($accessToken);

if (array_key_exists('error', $accessToken)) {
    throw new Exception(join(', ', $accessToken));
}

echo "Refresh Token: " . $accessToken['refresh_token'] . "\n";
?>
```

### 4. Crear carpeta de backups en Google Drive

1. Ve a [Google Drive](https://drive.google.com/)
2. Crea una carpeta llamada "SIGESA Backups"
3. Abre la carpeta y copia el ID de la URL:
   - URL ejemplo: `https://drive.google.com/drive/folders/1ABC123def456ghi789`
   - El ID es: `1ABC123def456ghi789`

### 5. Configurar variables de entorno

Agrega estas variables a tu archivo `.env`:

```env
# Google Drive Configuration for Backups
GOOGLE_DRIVE_CLIENT_ID=tu_client_id_aqui
GOOGLE_DRIVE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_DRIVE_REFRESH_TOKEN=tu_refresh_token_aqui
GOOGLE_DRIVE_FOLDER_ID=id_de_tu_carpeta_de_backups
GOOGLE_DRIVE_TEAM_DRIVE_ID=

# Backup Storage Configuration
BACKUP_STORAGE_DISK=google
```

### 6. Probar la configuración

Puedes probar la configuración ejecutando:

```bash
php artisan tinker
```

Y luego:

```php
Storage::disk('google')->put('test.txt', 'Prueba de conexión');
Storage::disk('google')->exists('test.txt');
Storage::disk('google')->delete('test.txt');
```

## Uso de la funcionalidad

### Crear backup en local (por defecto)

```bash
curl -X POST http://localhost:8000/api/backups \
  -H "Authorization: Bearer tu_token" \
  -H "Content-Type: application/json"
```

### Crear backup en Google Drive

```bash
curl -X POST http://localhost:8000/api/backups \
  -H "Authorization: Bearer tu_token" \
  -H "Content-Type: application/json" \
  -d '{"storage_disk": "google"}'
```

### Frontend (React)

```javascript
// Backup local
const response = await backupAPI.createBackup();

// Backup en Google Drive
const response = await backupAPI.createBackup({ storage_disk: 'google' });
```

## Notas importantes

- Los backups en Google Drive se almacenan comprimidos en formato ZIP
- Las descargas funcionan igual tanto para archivos locales como de Google Drive
- Se mantiene un registro en la base de datos del tipo de almacenamiento usado
- Los archivos temporales se eliminan automáticamente después de subir a Google Drive
