import {Config} from '@remotion/cli/config';

// Codec, CRF y formato de pixel van por linea de comando (ver README), asi el mismo
// config sirve para el render de audio solo (--codec=wav).
Config.setVideoImageFormat('png');
Config.setConcurrency(4);
// Chromium preinstalado en el contenedor (evita la descarga de Remotion).
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}
