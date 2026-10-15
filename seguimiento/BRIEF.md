# Bankz · Sistema de seguimiento de venta — brief completo para Claude Code

> Cómo usar este archivo: pegalo entero como primer mensaje de la sesión de Claude Code (o dejalo en la raíz del repo como `BRIEF.md` y decile "leé BRIEF.md y arrancá"). Junto con este archivo van `seed.json` (datos iniciales), `tracker.html` (prototipo funcional de referencia), `estetica-vidrio.md` (la especificación de estilo original de TrackeAR Pro), `referencia-impronta.png` (el clima visual buscado) y los logos. Todo se cita más abajo.

---

## 0. Tu rol y el objetivo

Sos el desarrollador de una aplicación web interna para **Bankz**, una empresa de cajas de seguridad privadas de Bahía Blanca, Argentina. La aplicación se llama **Bankz Seguimiento** y tiene un solo propósito: **medir el avance del plan de venta semana a semana, por cada una de sus aristas, y producir un informe en PDF para los socios.**

La usan cuatro personas: Manuel Schönhoff (fundador y presidente; dueño del sistema), sus dos socios (José De Robbio y el hermano de Manuel) y Martina Valcárcel (administradora; atiende el WhatsApp comercial y carga la mayoría de los datos). Nadie más. Se cuelga en Vercel detrás de una contraseña.

Trabajá en español rioplatense (voseo) en toda la interfaz, los mensajes y los commits. Sin emojis en ningún lado. Cuando algo no esté definido en este brief, **no lo inventes: dejá un `TODO(Manuel)` visible y preguntá al final**. Lo que sí está definido acá, respetalo al pie de la letra: cada número, cada nombre, cada regla de negocio viene de decisiones reales de los socios.

---

## 1. Qué es Bankz

- **Qué vende:** alquiler de cajas de seguridad privadas, dentro de una bóveda bancaria histórica recuperada (la del antiguo Banco del Sud), con construcción de estándar BCRA certificada. Primera empresa privada de resguardo patrimonial de Bahía Blanca. Abrió al público el 1 de septiembre de 2026.
- **Servicios complementarios:** sala de reuniones privada y verificación de billetes.
- **Entidad:** Grupo Libertador Bahía S.A. — CUIT 30-71875958-3.
- **Direcciones:** la **comercial es San Martín 133** (va en toda pieza, cartel, PDF y pantalla); San Martín 139 es la legal (solo contratos y documentación formal). En esta app, siempre 133.
- **Contacto canónico:** bankz.ar · @bankzarg · WhatsApp Business 291 448-5665 (lo atiende Martina) · info@bankz.ar · San Martín 133, Bahía Blanca. Horario de atención: lunes a viernes de 9 a 17.
- **Parque:** 999 cajas numeradas 0001–0999 en 16 módulos, cinco modelos. Distribución real por modelo: BKZ 1 = 480 · BKZ 2 = 240 · BKZ 3 = 192 · BKZ 4 = 78 · BKZ 5 = 9. Un contrato = una caja.
- **Modelos y medidas internas (alto × ancho × profundidad, cm):** BKZ 1 Chica 9×7×55 · BKZ 2 Mediana 9×22×55 · BKZ 3 Grande 12×22×55 · BKZ 4 Ejecutiva chica 25×22×55 · BKZ 5 Ejecutiva grande 51×27×60. Nunca usar las medidas externas.
- **Tarifario vigente (Preventa 2026, pesos argentinos, IVA incluido), por caja:**

| Modelo | 24 hs | Semana | Mes | Semestral (por mes) | Anual (por mes) |
|---|---:|---:|---:|---:|---:|
| BKZ 1 Chica | 40.000 | 80.000 | 130.000 | 115.000 | 90.000 |
| BKZ 2 Mediana | 55.000 | 105.000 | 175.000 | 155.000 | 120.000 |
| BKZ 3 Grande | 65.000 | 130.000 | 210.000 | 185.000 | 145.000 |
| BKZ 4 Ejecutiva chica | 70.000 | 140.000 | 230.000 | 205.000 | 160.000 |
| BKZ 5 Ejecutiva grande | 130.000 | 260.000 | 425.000 | 375.000 | 295.000 |

- **Seguridad (lo que se puede afirmar, sin marcas):** bóveda de estándar bancario certificada, monitoreo 24/7, acceso biométrico, doble llave, seguro por caja (USD 50.000 por caja, no ampliable). En ninguna pantalla ni PDF se nombran proveedores de seguridad, bancos ni competidores.
- **Equipo y sistemas que ya existen:** Martina lleva la operación y el embudo de WhatsApp. Hay un sistema de gestión administrativa propio (contratos, clientes, cajas, cobranza) hecho por un proveedor externo; esta app **no lo reemplaza ni se integra con él por ahora**: es el tablero comercial de los socios. La web bankz.ar está en Vercel con Supabase para reservas. Pagos por Mercado Pago Suscripciones y PayWay.
- **Etapas del pipeline en WhatsApp Business (ya en uso):** Nuevo › En conversación › Oferta enviada › Cita agendada › Follow-up › Cliente › Perdido.
- **Embudo comercial (regla de la casa):** el chat de WhatsApp tiene un único objetivo, agendar la visita presencial a la bóveda; cada mensaje termina en pregunta; nunca se vuelca toda la información junta. **El contrato se firma en la bóveda.** La pregunta fija en cada consulta y cada visita es "¿Cómo nos conociste?": de ahí sale el origen de cada cliente.

---

## 2. Reglas de marca y de copy que esta app tiene que respetar

1. **Privacidad absoluta:** la app nunca pregunta, sugiere ni registra qué guarda un cliente en su caja. No existe ningún campo para eso. Tampoco se cargan datos sensibles del cliente más allá de nombre, teléfono y origen.
2. **Sin proveedores, bancos ni competencia** en ninguna pantalla, nota por defecto, placeholder ni PDF. Las afirmaciones de seguridad van sin marcas (ver sección 1).
3. **Tono:** corporativo, sobrio, directo. Español rioplatense con voseo ("cargá", "marcá", "exportá"). Sin signos de exclamación, sin emojis, sin adjetivos de lujo. Cierre de marca en el pie de todo lo que se imprime: **"Estás seguro."**
4. **Dirección:** San Martín 133 siempre.
5. **TEGETE / TGT** es la agencia de diseño y producción audiovisual. Puede aparecer en el plan de acción interno (ahí ya está), nunca en algo que vaya a un cliente.
6. **Manual de marca para piezas externas:** tipografía Alexandria, Negro Medianoche #05090A y Blanco Nieve #F9F9F9, paleta monocromática, isotipo radial tipo puerta de bóveda, nada de dorados ni degradados. **Esta app es una herramienta interna y Manuel decidió que use la estética "Vidrio" (sección 10), que es distinta.** La regla es: la app en Vidrio; **todo lo que sale de la app hacia afuera (el informe PDF) respeta el formato de Documentos Bankz** (sección 9), que usa Helvetica, barras negras y el pie confidencial.
7. **No inventar datos.** Si un número no está acá, se pregunta.

---

## 3. La estrategia de venta (documento interno "Estrategia y Análisis de Venta", versión 5 del 02/10/2026)

Este documento es la columna vertebral de la app. Cada sección del documento es una "arista" y cada arista es una pantalla o un bloque del tablero.

### 3.1 Dónde estamos

- 999 cajas. **8 contratos al 01/10/2026**, primer mes de operación: 6 por boca a boca, 2 por redes. Con 8 cajas por mes se ocupan 96 en un año, menos del 10% de la bóveda: ese ritmo no alcanza y ningún canal por sí solo lo multiplica. Por eso el plan ataca todos los frentes a la vez.
- **Punto de equilibrio:** en análisis. Manuel lo está calculando con proyección lineal, exponencial, media y media conservadora, en dos escenarios según las ofertas reales (40% los primeros 3 meses y 20% anual) y luego en tres fases (conservador, medio, agresivo). La estimación preliminar que mencionó es **80 a 100 cajas ocupadas**. En la app el punto de equilibrio es un parámetro editable (mínimo, máximo y nota), no una constante.

### 3.2 La oferta, por tipo de cliente (vigente desde el 02/10)

| A quién | Descuento | Por dónde llega | Plazo |
|---|---|---|---|
| Redes y quien llega sin referencia (promo de apertura) | **40%** durante los primeros 3 meses | Redes, prensa, calle, mailing, recontactos | Primeros 3 meses |
| Instituciones (socios/matriculados de colegios, cámaras, etc.) | **25%** | Acuerdos comerciales | Sobre plan anual, solo el primer año |
| Personas que llegan por empresas (REMAX, UNO, Bahía Blanca Propiedades) | **20%** | Acuerdos comerciales | Sobre plan anual, solo el primer año |
| Referidos de vendedores a comisión | **20%** | Fuerza de venta | Sobre plan anual, solo el primer año |
| Clientes que refieren a otro cliente | Un mes bonificado para el cliente que refiere | Fuerza de venta | Aplica solo cuando el referido firma y paga su primer mes |

Reglas: un solo descuento por cliente, no se acumulan. Cada canal comunica la oferta de su segmento y ninguna otra. Las instituciones y empresas **no cobran comisión** por derivar (rompería la confidencialidad); lo que reciben es el beneficio para su gente y **una caja sin cargo por un año** para la institución que firma (el 01/10 se definió BKZ 3 Grande; las cartas de convenio que salieron el 05/10 dicen BKZ 2: tratalo como `TODO(Manuel)` y dejá el modelo de la caja de cortesía como campo editable del acuerdo).

Nota de precios para el plan anual con 20%: BKZ 1 $72.000 · BKZ 2 $96.000 · BKZ 3 $116.000 · BKZ 4 $128.000 · BKZ 5 $236.000 por mes (lista anual menos 20%, IVA incluido).

### 3.3 Los seis frentes

**Frente 1 · Redes sociales.** Material: placas y flyers (listos; lo que mejor funciona en anuncios), video institucional "Pipi" (grabado, falta edición), videos profesionales guionados con TGT para tres públicos (Personal, Empresarial, Prescriptores; en proceso), motion graphics (en proceso), Google (solo ficha de negocio; pedir reseñas a los clientes), LinkedIn (activo; darle continuidad). Lectura: 2 de los 8 clientes llegaron por redes. Las placas traen consultas hoy; los videos construyen la confianza que convierte la consulta en visita. A definir: presupuesto de pauta y calendario de publicación.

**Frente 2 · Acuerdos comerciales.** Secuencia: carta formal › llamado › visita de la comisión directiva a la bóveda › convenio › comunicación a sus miembros. La carta sola no vende; vende que la comisión directiva conozca la bóveda. Grupos:
- *Instituciones, 11 cartas listas al 01/10 (sin enviar en ese momento):* Cámara de Comercio e Industria, Cámara Industrial Joven, Bolsa de Comercio, Colegio de Arquitectos, Colegio de Escribanos, Colegio de Contadores, Cámara de la Construcción, Unión Industrial, Asociación de Agencias de Viaje, Cámara Arbitral de Cereales, Consorcio de Gestión del Puerto.
- *Instituciones ya contactadas:* Colegio de Martilleros (carta entregada; contacto Carlos Esteban), Cámara de Desarrolladores Urbanos (carta entregada; Ruso Marini), Colegio de Abogados (en marcha; Chiro; falta la carta), Corporación del Comercio (reunión hecha; Pipo). Colegio de Escribanos tiene contacto (Moroco).
- *Empresas con nuestro público:* REMAX, Bahía Blanca Propiedades, UNO Bahía Club. Primera reunión hecha con las tres; falta el convenio por escrito (20% para su gente y caja sin cargo) y un envío a su padrón.
- *Prescriptores directos:* estudios jurídicos y contables, escribanías, inmobiliarias, joyerías, concesionarias. Sin contacto directo todavía; visita uno a uno a los más grandes. Descuento a confirmar con Manuel (`TODO(Manuel)`).
- *Clientes de Cambio General* (otra empresa de Manuel, casa de cambio): público propio con el perfil exacto; beneficio por pertenencia, igual que el resto de los acuerdos.

**Frente 3 · Fuerza de venta.** Dos canales:
- *Vendedores a comisión* (aliados estratégicos y vendedores en la calle, con llegada propia al público): cobran **el primer mes al precio que cierra el cliente, sea la caja que sea**; como sus referidos entran con 20%, la comisión por caja es 72.000 / 96.000 / 116.000 / 128.000 / 236.000 según el modelo. **El IVA es un costo que asume Bankz.** Se paga **contra cobro**: cuando el cliente firmó y pagó su primer mes. Un origen por cliente, registrado en la primera visita, con el **código del vendedor** (V01 a V19). El vendedor agenda la visita por WhatsApp con su código **o pasa el contacto, y Bankz también lo llama**: no se espera a que el interesado escriba. Material: cada vendedor recibió una guía personalizada (PDF con su nombre y código).
- *Clientes que refieren:* un mes sin cargo por cada cliente nuevo que traen, cuando el referido firmó y pagó su primer mes.

**Frente 4 · Prensa.** Siete medios: La Nueva, La Brújula, BHInfo, Frente a Cano, WIPS, Entre Tazas y Café, Café x Medio. Regla: salir **la misma semana en los siete** (prevista del 13 al 16/10). Una sola gacetilla, un solo kit (fotos, video institucional, carpeta), enviados el mismo día a todos, más invitación a los periodistas a recorrer la bóveda. La noticia: primera empresa privada de resguardo patrimonial de la ciudad, en la bóveda recuperada del antiguo Banco del Sud; "en los bancos no hay lugar". A definir con cada medio: nota periodística, espacio pago o ambos. Dato real: Entre Tazas y Café (la columna de Florín en La Nueva) ya confirmó una nota; el diario la redacta y Manuel manda los temas.

**Frente 5 · Calle.** Carteles LED y físicos en las zonas más transitadas. Hay artes de cartel vertical y valla horizontal en formato de imprenta, pero dicen "Preventa exclusiva" y hay que actualizarlos. Criterio: el cartel tiene tres segundos; dice qué es ("Cajas de seguridad privadas"), la marca, la web y San Martín 133. A definir: ubicaciones y presupuesto.

**Frente 6 · Base de datos, mailing, recontactos y círculo cercano.** Base única con todos los contactos propios (reservas de la web, consultas de WhatsApp, visitas, clientes), cada uno con origen y estado. Mailing periódico con la oferta vigente (herramienta a definir). Recontacto uno a uno, por WhatsApp, de toda consulta y toda visita que no cerró, con la oferta del 40%. Círculo cercano: cada socio le envía información a sus propios contactos, uno por uno y en primera persona; es una pasada con fecha de cierre (envíos 06 al 08/10, cierre 16/10), no un canal permanente. Regla: el mailing solo a contactos que dejaron sus datos y con opción de baja.

### 3.4 Por qué atacar todo junto y ahora

La cuenta no cierra con un canal. Las instituciones deciden lento (comisión o consejo directivo), así que cada día sin carta es un reloj que no arrancó. Marca nueva en un rubro de confianza: nadie contrata custodia por un solo anuncio; la confianza se arma cuando la misma persona ve a Bankz en su colegio, en el diario, en la calle y en el celular. Bahía Blanca es una plaza chica: presencia simultánea la cubre rápido. Y ser los primeros tiene vencimiento.

### 3.5 Embudo y medición

Origen › Consulta (WhatsApp) › Visita a la bóveda › Contrato (firma, pago del primer mes, caja activa) › Cliente que refiere (vuelve a alimentar el origen). Todo "Perdido" y toda visita que no cerró vuelve a la etapa de consulta con la oferta vigente.

Medición: con seis frentes abiertos, lo único que permite decidir dónde poner más es saber de dónde viene cada consulta, cada visita y cada contrato. Pregunta fija "¿Cómo nos conociste?"; un origen por cliente, cargado el mismo día; **reporte todos los lunes** con consultas, visitas y contratos por frente; con el reporte se decide: se refuerza el frente que trae visitas, se corrige o se corta el que no. Tablero de partida al 01/10: Redes 2 contratos, referidos y boca a boca 6, el resto 0, total 8. Consultas y visitas por frente no se registraron hasta esa fecha.

Lo que puede frenar el ataque: capacidad de atención (hoy se muestran 3 a 5 visitas por día y el WhatsApp tiene una sola persona a cargo), presupuesto sin tope por frente, y responsables sin asignar.

### 3.6 Plan de acción (45 acciones)

Cronograma: **Arranque** viernes 02/10 a lunes 05/10 · **Semana 2** 05 al 09/10 · **Semana 3** martes 13 al viernes 16/10 (lunes 12 feriado) · **Semana 4** 19 al 23/10 · **Rutina** diaria y de los lunes. Cada acción tiene número, fecha límite, frente, condición de "hecho" y responsable (casi todos vacíos: asignarlos es la acción 4). La tabla completa, tal como está en el documento:

| N° | Fecha límite | Frente | Acción | Hecho cuando | Responsable |
|---|---|---|---|---|---|
| | **ARRANQUE — viernes 02/10 a lunes 05/10** | | | | |
| 1 | 02/10 | 1 · Redes | Reunión con TGT por los videos guionados: Personal, Empresarial y Prescriptores. | Fechas de rodaje y de entrega por escrito. |  |
| 2 | 02/10 | 1 · Redes | Encargar la edición del video institucional. | Edición encargada, con fecha de entrega. |  |
| 3 | 02/10 | 3 · Fuerza de venta | Guía para vendedores. (hecha el 02/10) | Hecho. PDF listo para imprimir. |  |
| 4 | 02/10 | Los seis | Asignar un responsable por frente y un tope de presupuesto para pauta, cartelería y prensa. | Un nombre y un monto por frente. | Socios |
| 5 | 05/10 | Oferta | Cargar la oferta por segmento en web, anuncios y guion de WhatsApp. | Cada canal con la oferta de su segmento. |  |
| 6 | 05/10 | 1 · Redes | Prender la pauta con placas y el 40% los primeros 3 meses. | Campaña activa. |  |
| 7 | 05/10 | 2 · Acuerdos | Cerrar la lista de instituciones, empresas y prescriptores. | Lista con nombre de contacto en cada uno. |  |
| 8 | 05/10 | 2 · Acuerdos | Entregar las 11 cartas juntas y la del Colegio de Abogados. | 12 cartas entregadas, con nombre de quien recibió. |  |
| 9 | 05/10 | 3 · Fuerza de venta | Listar a los primeros vendedores y aliados y asignar un código a cada uno. | Lista con nombre, teléfono y código. |  |
| 10 | 05/10 | 6 · Círculo cercano | Cada socio arma la lista de su círculo cercano. | Una lista por socio, cargada en la base. | Cada socio |
| 11 | 05/10 | 6 · Círculo cercano | Definir el mensaje tipo y el material que se envía: carpeta institucional e invitación a conocer la bóveda. | Mensaje y material aprobados. |  |
| 12 | 05/10 | Medición | Planilla por frente y pregunta fija: "¿Cómo nos conociste?". | Planilla en uso. |  |
| 13 | 05/10 | Atención | Definir quién responde WhatsApp, quién muestra la bóveda cuando suban las visitas y el tiempo máximo de respuesta. | Cobertura y tiempo máximo definidos. |  |
| | **SEMANA 2 — lunes 05/10 a viernes 09/10** | | | | |
| 14 | 06/10 | 3 · Fuerza de venta | Comunicar el programa de referidos a los clientes. | 8 clientes avisados. |  |
| 15 | 06 al 08/10 | 6 · Círculo cercano | Cada socio envía la información a su lista, uno por uno. | Lista completa enviada y cada contacto cargado en la base. | Cada socio |
| 16 | 07/10 | 2 · Acuerdos | Llamar a las 15 instituciones y agendar la visita a la bóveda. | 15 llamados hechos; cada una con fecha de visita o respuesta registrada. |  |
| 17 | 07/10 | 3 · Fuerza de venta | Imprimir la guía para vendedores. | Guías impresas. |  |
| 18 | 07/10 | 6 · Base de datos | Armar la base única: reservas web, consultas, visitas y clientes. | Base cargada, con origen y estado por contacto. |  |
| 19 | 08/10 | 4 · Prensa | Gacetilla y kit de prensa: fotos, carpeta y video institucional. | Kit listo. |  |
| 20 | 09/10 | 4 · Prensa | Enviar el kit a los 7 medios el mismo día e invitar a los periodistas a recorrer la bóveda. | Kit enviado a los 7 y salida confirmada para el 13 al 16/10. |  |
| 21 | 09/10 | 2 · Acuerdos | REMAX, Bahía Blanca Propiedades y UNO: convenio con 20% y caja BKZ 3. | 3 convenios enviados para firma. |  |
| 22 | 09/10 | 2 · Acuerdos | Prescriptores: primeras visitas uno a uno. | Primeras visitas agendadas. |  |
| 23 | 09/10 | 3 · Fuerza de venta | Convocar a los primeros vendedores y aliados: entregar guía y código. | Vendedores con guía y código asignado. |  |
| 24 | 09/10 | 6 · Base de datos | Recontactar consultas y visitas que no cerraron. | Todos recontactados con la oferta vigente. |  |
| 25 | 09/10 | 6 · Base de datos | Primer mailing a la base. | Mail enviado. |  |
| 26 | 09/10 | 6 · Círculo cercano | Seguimiento a quienes respondieron: agendar la visita a la bóveda. | Visitas agendadas, con origen cargado. | Cada socio |
| 27 | 09/10 | 5 · Calle | Actualizar artes. Relevar ubicaciones LED y físicas. Pedir presupuestos. | Presupuestos recibidos y ubicaciones elegidas. |  |
| 28 | 09/10 | 1 · Redes | LinkedIn con publicación sostenida. Pedir reseñas en Google a los clientes. | Calendario en marcha. Reseñas pedidas a los 8. |  |
| | **SEMANA 3 — martes 13/10 a viernes 16/10 (lunes 12 feriado)** | | | | |
| 29 | 13/10 | Medición | Primer reporte semanal por frente. | Reporte entregado a los socios. |  |
| 30 | 13 al 16/10 | 4 · Prensa | Salida en los 7 medios, la misma semana. | 7 publicaciones. |  |
| 31 | 16/10 | 2 · Acuerdos | Segundo llamado a las instituciones que no respondieron. | Cada institución con visita agendada o respuesta registrada. |  |
| 32 | 16/10 | 2 · Acuerdos | Primeras visitas de comisiones directivas a la bóveda. | Visitas hechas y propuesta de convenio entregada. |  |
| 33 | 16/10 | 1 · Redes | Video institucional publicado y en pauta. | Video al aire. |  |
| 34 | 16/10 | 3 · Fuerza de venta | Seguimiento a vendedores: contactos pasados y visitas agendadas por código. | Cada vendedor con su número de la semana. |  |
| 35 | 16/10 | 5 · Calle | Contratar ubicaciones y mandar a producción. | Espacios contratados. |  |
| 36 | 16/10 | 6 · Círculo cercano | Cerrar la pasada: ningún contacto sin respuesta registrada. | Todas las listas cerradas en la base. | Cada socio |
| | **SEMANA 4 — lunes 19/10 a viernes 23/10** | | | | |
| 37 | 20/10 | 4 · Prensa | Publicar las notas de prensa en redes, LinkedIn y mailing. | Notas publicadas. |  |
| 38 | 23/10 | 5 · Calle | Cartelería en la calle. | Carteles instalados y LED al aire. |  |
| 39 | 23/10 | 2 · Acuerdos | Primeros convenios firmados y comunicados a sus miembros. | Convenio firmado y comunicación enviada por la institución. |  |
| 40 | 23/10 | 1 · Redes | Videos guionados, según fechas acordadas con TGT. | Primer video entregado o fecha confirmada. |  |
| 41 | 23/10 | 3 · Fuerza de venta | Balance por vendedor: visitas y contratos por código. Liquidar las comisiones de contratos cobrados. | Balance hecho y comisiones pagadas contra cobro. |  |
| 42 | 23/10 | 6 · Base de datos | Segundo mailing a la base. | Mail enviado. |  |
| 43 | 23/10 | Los seis | Revisión del mes con el reporte. | Decisión tomada: qué frente se refuerza y cuál se corrige. | Socios |
| | **RUTINA — todos los días y todos los lunes** | | | | |
| 44 | Diario | Atención | Responder toda consulta dentro del tiempo máximo y cargar su origen. | Ninguna consulta sin responder ni sin origen al cierre del día. |  |
| 45 | Lunes | Medición | Reporte de consultas, visitas y contratos por frente. | Reporte entregado a los socios. |  |

Convenciones: "Los seis" = acción transversal a todos los frentes. "Oferta", "Medición" y "Atención" son frentes transversales del plan. Las acciones 44 y 45 no tienen fecha límite: son rutina.

---

## 4. Estado real al 14 de octubre de 2026 (lo que se sabe y lo que no)

- El plan arrancó el 02/10. Hoy estamos en la semana 3 y hay **28 acciones con fecha vencida que nadie marcó como hechas**, porque todavía no existía el sistema. Lo único confirmado hecho es la acción 3 (guía para vendedores, 02/10). Las 19 guías personalizadas se generaron el 05/10; Manuel iba a enviarlas, no está confirmado a quiénes llegó ni quién visitó la bóveda. El primer uso de la app va a ser que Manuel marque qué se hizo.
- Prensa: Entre Tazas y Café confirmada. Los otros seis medios, sin dato.
- Acuerdos: ver estados en el seed (sección 12). Las 11 cartas: no hay confirmación de que se hayan entregado. REMAX, Bahía Blanca Propiedades y UNO: reunión hecha, convenio no enviado (hasta donde se sabe).
- Contratos nuevos desde el 01/10: no hay dato cargado. Base: 8.
- Punto de equilibrio: en análisis; preliminar 80–100.
- Responsables por frente y presupuestos: sin definir.

Nada de esto se rellena con supuestos. Lo que no está, queda vacío y visible como vacío.

---

## 5. Qué tiene que hacer la aplicación

Una app web (desktop y celular), con contraseña, donde cuatro personas cargan datos cortos cada día o cada lunes y Manuel saca un informe PDF para los socios. Siete pantallas, una por arista, más la configuración.

### 5.1 Dónde estamos (inicio)
Resumen de un vistazo, estilo widgets:
- **Cajas ocupadas** sobre 999 (número grande, barra, porcentaje). Un contrato = una caja.
- **Punto de equilibrio:** ocupadas sobre el mínimo configurado (y el máximo si difiere), con la nota configurada.
- **Contratos nuevos desde la fecha base**, con consultas y visitas acumuladas.
- **Ritmo real** (contratos por semana, sobre las semanas con datos) y **semanas que faltan** para el equilibrio a ese ritmo.
- **Ritmo necesario** (contratos por semana) para llegar al equilibrio mínimo en un año desde la fecha base.
- **Plan de acción:** hechas / total, vencidas, en curso, trabadas.
- **Esta semana:** consultas, visitas, contratos.
- **Contratos por frente** (barras: base al 01/10 y nuevos desde entonces), **semana a semana** (consultas, visitas, contratos por semana), **lo que vence primero** (próximas 6 acciones no hechas por fecha; las vencidas, marcadas), y **contratos por modelo** (ocupación de cada BKZ sobre su parque: 480/240/192/78/9).

### 5.2 Tablero semanal
Una fila por semana (lunes a domingo) desde la semana del 28/09/2026 hasta la semana actual, que aparece sola cada lunes. Columnas por frente: **Consultas, Visitas, Contratos**, para los siete orígenes: 1 Redes sociales · 2 Acuerdos comerciales · 3 Fuerza de venta (vendedores) · 3 Fuerza de venta (referidos y boca a boca) · 4 Prensa · 5 Calle · 6 Base de datos, mailing, recontactos y círculo cercano. Totales por semana, acumulado, y tasas visita/consulta y contrato/visita por frente. Celda vacía = sin dato (no cero): la semana se marca "sin datos" hasta que alguien cargue algo. Las consultas y visitas se cargan como números; **los contratos salen del registro de contratos (5.7), no se tipean acá** (si preferís que también se puedan tipear, que la celda muestre el conteo del registro y permita un ajuste manual con nota; lo simple gana).

### 5.3 Embudo
Consultas › Visitas › Contratos, con las conversiones totales y una tabla por frente (consultas, visitas, contratos, visita/consulta, contrato/visita, contrato/consulta). Es lo que se lee los lunes para decidir dónde poner más.

### 5.4 Plan de acción
Las 45 acciones agrupadas por semana del plan. Por acción: número, fecha límite (o rango, o "Diario"/"Lunes"), frente, acción, condición de hecho, **estado** (Pendiente / En curso / Hecho / Trabado), responsable, fecha en que se hizo, nota. **Una acción vence cuando pasó su fecha límite y no está en Hecho**; se muestra "Vencida · N días". Filtros: todas, pendientes, vencidas, en curso o trabadas, hechas. Tiles de avance por frente (hechas / total). Se pueden agregar acciones nuevas (número siguiente, semana a elegir). Historial mínimo: quién cambió el estado y cuándo.

### 5.5 Vendedores
Los 19 vendedores con código V01–V19: nombre, teléfono, guía entregada (sí/no, fecha), conoció la bóveda (sí/no, fecha), contactos pasados, visitas, contratos (derivados del registro de contratos por código), comisión devengada (suma del primer mes de cada contrato cobrado con su código), comisión pagada (se carga), saldo, nota. Resumen arriba: vendedores, con guía, que conocieron la bóveda, contactos, visitas, contratos, comisiones pagadas. Alta de vendedor nuevo (código siguiente). Dos casos a resolver con Manuel, ya anotados en el seed: "Cajeros ICBC" y "Los Piro" son grupos, y la comisión se paga a una persona: un código por persona.

Lista inicial (orden = código): Tomás Santos, Coco, Cristian Haag, Daniel Burgos, Facundo Moreira, Cristian Munafo, Carolina Sánchez, Lucas Vera, Mónica (Intercambio Financiero), Pullman, Francisco Cura, Cajeros ICBC, Pedro Peñalva, César Lombardi, Mauricio Corpaz, Juan Comignani, María Rosa (Corporación), Los Piro, Faggiano.

### 5.6 Acuerdos y prensa
**Acuerdos:** una fila por institución o empresa: nombre, grupo (institución / empresa / prescriptor / otro), contacto, **etapa** (Sin contacto › Carta entregada › Llamado hecho › Reunión o visita a la bóveda › Convenio enviado › Convenio firmado › Comunicado a sus miembros; más Descartado), fecha del último paso, descuento del convenio (25% o 20%), caja de cortesía (modelo, editable), nota, historial de pasos con fecha. Resumen por etapa arriba. Alta y baja.
**Prensa:** los siete medios con estado (Sin contacto › Kit enviado › Salida confirmada › Publicado; o No sale), fecha, tipo (nota, espacio pago, ambos), link y nota.

### 5.7 Registro de contratos
Es la fuente de verdad de "contratos" para toda la app. Un registro por contrato (= por caja): fecha de firma, fecha de cobro del primer mes, modelo (BKZ 1–5), plan (24 hs / semana / mes / semestral / anual), **origen** (uno de los siete frentes del tablero), código de vendedor si corresponde, cliente que refirió si corresponde (solo nombre o iniciales; nada más), segmento de oferta aplicado (40% 3 meses / 25% institución / 20% empresa / 20% referido de vendedor / sin descuento / otro, con la institución o empresa si aplica), precio mensual cobrado, nota. De acá se derivan: cajas ocupadas, contratos por frente y por semana, contratos por modelo, comisión devengada por vendedor (= precio mensual cobrado del primer mes, para origen "vendedores" con código) y mes bonificado pendiente para referidos de clientes. Los 8 contratos base del 01/10 **no** se cargan como registros individuales (no tenemos su detalle): van como parámetro "contratos al inicio: 8, de redes 2, de referidos 6" y se suman a los derivados. Si Manuel después los carga uno por uno, el parámetro baja a 0.

### 5.8 Informe PDF
Botón "Exportar informe". Genera el **Informe de avance comercial** en formato Documentos Bankz (sección 9), con fecha, y lo descarga. Contenido y orden: Dónde estamos · Tablero por frente (acumulado y por semana) · Embudo · Plan de acción (las 45 con estado; vencidas en negrita; resumen arriba) · Fuerza de venta (vendedores) · Acuerdos comerciales · Prensa. También un informe "solo esta semana" (la semana elegida contra la anterior) si es fácil; si no, lo dejás para después.

### 5.9 Configuración
Contratos al inicio y su origen, fecha base (01/10/2026), cajas totales (999) y parque por modelo, punto de equilibrio mínimo/máximo y nota, tarifario (editable, con fecha de vigencia), descuentos por segmento, comisión de vendedores (regla: primer mes al precio cobrado), contraseña/usuarios.

---

## 6. Modelo de datos (Postgres)

Nombres en español, snake_case. Fechas como `date`, timestamps en UTC. Todas las tablas con `created_at`, `updated_at`, `updated_by` (nombre del usuario que editó).

```sql
-- Parámetros globales (una sola fila)
config(
  id int primary key default 1,
  fecha_base date not null default '2026-10-01',
  contratos_base int not null default 8,
  base_redes int not null default 2,
  base_referidos int not null default 6,
  cajas_total int not null default 999,
  parque jsonb not null default '{"BKZ1":480,"BKZ2":240,"BKZ3":192,"BKZ4":78,"BKZ5":9}',
  eq_min int default 80, eq_max int default 100,
  eq_nota text default 'Estimación preliminar. El análisis de punto de equilibrio está en curso.'
)

tarifario(modelo text, plan text, precio int, vigente_desde date)  -- seed con la tabla de la sección 1

frentes: enum o tabla fija con clave y nombre:
  redes '1 · Redes sociales' · acuerdos '2 · Acuerdos comerciales' · vendedores '3 · Fuerza de venta — vendedores'
  · referidos '3 · Fuerza de venta — referidos y boca a boca' · prensa '4 · Prensa' · calle '5 · Calle'
  · base '6 · Base de datos, mailing, recontactos y círculo cercano'

semanas(
  lunes date primary key,                 -- lunes de la semana
  consultas jsonb not null default '{}',  -- {"redes": 6, "acuerdos": null, ...}  null = sin dato
  visitas   jsonb not null default '{}',
  ajuste_contratos jsonb default '{}',    -- opcional, con nota
  nota text
)

acciones(
  n int primary key, fecha_limite date, rango_label text, frente text not null,
  accion text not null, hecho_cuando text not null, responsable text,
  estado text not null check (estado in ('pendiente','en_curso','hecho','trabado')) default 'pendiente',
  fecha_hecho date, nota text, semana_plan text not null
)
acciones_historial(id, accion_n, estado_anterior, estado_nuevo, usuario, at)

vendedores(
  codigo text primary key,  -- 'V01'
  nombre text, telefono text, guia_entregada bool default false, guia_fecha date,
  conocio_boveda bool default false, boveda_fecha date,
  contactos int default 0, visitas int default 0, comision_pagada int default 0, nota text, activo bool default true
)

acuerdos(
  id uuid, nombre text, grupo text check (grupo in ('institucion','empresa','prescriptor','otro')),
  contacto text, etapa text check (etapa in ('sin_contacto','carta','llamado','reunion','convenio_enviado','firmado','comunicado','descartado')),
  fecha_ultimo_paso date, descuento int, caja_cortesia text, nota text, orden int
)
acuerdos_historial(id, acuerdo_id, etapa, fecha, usuario, nota)

prensa(id, medio text, estado text check (estado in ('sin_contacto','kit','confirmado','publicado','no')), fecha date, tipo text, link text, nota text, orden int)

contratos(
  id uuid, fecha_firma date not null, fecha_cobro date, modelo text not null, plan text not null,
  origen text not null,  -- clave de frente
  vendedor_codigo text references vendedores, referido_por text,
  segmento text check (segmento in ('40_3m','25_institucion','20_empresa','20_vendedor','sin_descuento','otro')),
  acuerdo_id uuid references acuerdos, precio_mensual int, nota text, baja date
)

usuarios(id, nombre, rol check (rol in ('admin','carga','lectura')), password_hash)
```

Si preferís una sola contraseña compartida en vez de usuarios, hacelo así en la primera versión y guardá igual el **nombre** de quien edita (se lo pedís una vez por sesión y lo recordás en una cookie).

---

## 7. Cálculos y reglas (exactos)

- `contratos_nuevos` = cantidad de `contratos` activos con `fecha_cobro` no nula (un contrato cuenta cuando se cobró el primer mes; si no hay fecha de cobro, aparece como "firmado, sin cobrar" y no suma).
- `cajas_ocupadas` = `config.contratos_base` + `contratos_nuevos` − bajas.
- Por frente: `base` (de config, solo redes y referidos) + contratos nuevos con ese origen.
- Semana de un contrato = lunes de su `fecha_cobro`.
- `ritmo` = contratos_nuevos / semanas con datos (una semana tiene datos si alguna celda de consultas o visitas no es nula o tiene un contrato). Si no hay semanas con datos: "sin datos".
- `faltan` = max(0, eq_min − cajas_ocupadas). `semanas_hasta_equilibrio` = faltan / ritmo (solo si ritmo > 0).
- `ritmo_necesario` = faltan / semanas que quedan hasta `fecha_base + 365 días` (mínimo 1 semana).
- Acción vencida: `fecha_limite < hoy` y `estado != 'hecho'`. Días vencida = hoy − fecha_limite. Las acciones sin fecha (rutina) nunca vencen.
- Comisión devengada por vendedor = suma de `precio_mensual` de sus contratos con `fecha_cobro`. Saldo = devengada − `comision_pagada`.
- Tasas: visita/consulta = visitas / consultas; contrato/visita = contratos / visitas; "—" cuando el denominador es 0.
- Moneda: pesos, sin decimales, separador de miles con punto (`$1.180.000`). Fechas en pantalla `dd/mm`, en PDF `dd/mm/aaaa`. Zona horaria America/Argentina/Buenos_Aires para "hoy" y para el lunes de cada semana.
- Semana = lunes a domingo. La primera semana del tablero es la del 28/09/2026 (el plan arrancó el viernes 02/10). Etiquetas del plan: 28/09 "Arranque", 05/10 "Semana 2", 12/10 "Semana 3", 19/10 "Semana 4".

---

## 8. Lo que ya existe y podés reusar

- **`tracker.html`**: prototipo funcional de una sola página que hice antes de este brief (vive como artifact privado en claude.ai con base de datos compartida). Reusá de ahí **la lógica de cálculo** (`compute()`), **la generación del PDF** (jsPDF + jspdf-autotable, función `exportPDF`, ya probada: cuatro páginas en formato Documentos Bankz) y los textos de ayuda de cada pantalla. De su estética tomá solo los grises (es monocroma, marca Bankz, coherente con la paleta de 10.2); la forma de vidrio sale de la sección 10. **No** reuses su capa de datos (`claude.use('db')`, que solo existe dentro de claude.ai).
- **`seed.json`**: los datos iniciales (config, 45 acciones, 19 vendedores, 18 acuerdos, 7 medios) con las claves que usa `tracker.html`. Importalos tal cual en la primera migración.
- **`estetica-vidrio.md`**: la especificación de estilo original, escrita para TrackeAR Pro (otro producto de Manuel). La sección 10 de este brief es la misma especificación adaptada a Bankz y fusionada con la impronta de tablero; ante una duda, manda la sección 10.
- **`referencia-impronta.png`**: captura de un anuncio de un producto ajeno que muestra el clima buscado para la primera pantalla (panel oscuro con widgets de KPI, gráfico de líneas, anillo de progreso, tabla con sparklines). Es referencia de **composición, nada más**: su color verde **no se usa** (la app es blanco y negro Bankz, sección 10.2), y no se copia marca, logo, textos ni datos.

---

## 9. Informe PDF — formato Documentos Bankz (obligatorio)

A4 vertical, márgenes 46 pt, tipografía **Helvetica** (normal, bold, oblique). Colores: negro #05090A, gris #595959, caja gris #EFEFEF, borde #BFBFBF, blanco.

- **Encabezado (solo en la primera página):** logo horizontal negro de Bankz arriba a la izquierda, 73 × 22 pt. Debajo, dos líneas en Helvetica 7 gris: "Grupo Libertador Bahía S.A. — CUIT 30-71875958-3" y "San Martín 133, Bahía Blanca, Buenos Aires". A la derecha, alineado a la derecha: título "INFORME DE AVANCE COMERCIAL" en Helvetica-Bold 13 negro; debajo "SEGUIMIENTO DEL PLAN DE VENTA" en Bold 8,5; debajo "Sucursal Casa Central" en 7 gris.
- **Línea de introducción:** Helvetica-Oblique 7,4 negro: "Generado el dd/mm/aaaa desde el tablero de seguimiento. Punto de partida: 8 contratos al 01/10/2026." más la nota del equilibrio.
- **Barras de sección:** rectángulo negro de 15 pt de alto, ancho completo, con el título en Helvetica-Bold 8,5 blanco, MAYÚSCULAS, 6 pt desde el borde izquierdo. Títulos: DÓNDE ESTAMOS · TABLERO POR FRENTE · EMBUDO DE VENTA · PLAN DE ACCIÓN · FUERZA DE VENTA — VENDEDORES · ACUERDOS COMERCIALES · PRENSA.
- **Tablas:** encabezado con fondo negro y texto blanco Bold 7,2; cuerpo Helvetica 7,6–7,8 negro; grilla de 0,4 pt en #BFBFBF; padding 3–4 pt; filas de grupo (p. ej. "SEMANA 2 — lunes 05/10 a viernes 09/10") con fondo #EFEFEF y negrita, ocupando todas las columnas; números alineados a la derecha; totales en negrita.
- **Cajas de texto destacado:** fondo #EFEFEF, borde 0,5 pt #BFBFBF, padding 6–8 pt.
- **Pie en todas las páginas:** Helvetica 7 gris, a 24 pt del borde inferior: izquierda "BANKZ — Documento interno y confidencial — dd/mm/aaaa — Informe de avance comercial"; derecha "Página N de M".
- Logo: tenés `logo_dark.png` (horizontal negro, con transparencia) en el repo; si no está, pedilo. Nunca el logo blanco sobre blanco.
- Nombre del archivo: `Bankz_Informe_de_Avance_aaaa-mm-dd.pdf`.

Podés generarlo en el cliente (jsPDF + autotable, como en `tracker.html`) o en el servidor (`@react-pdf/renderer`, Playwright/Chromium). Lo que importa es que el resultado se vea idéntico a esta especificación.

---

## 10. Estética de la aplicación: "Vidrio" con impronta de tablero analítico

Manuel eligió para esta herramienta interna la estética "Vidrio" de TrackeAR Pro (vidrio esmerilado estilo iOS, especificación en 10.1 a 10.8, sacada del CSS real de sus piezas) **combinada con la impronta de un tablero analítico oscuro**: la referencia visual está en `referencia-impronta.png` (captura de un anuncio ajeno; se toma la composición, nunca el color verde, la marca, el logo ni los textos). La fusión se define en 10.0 y 10.9; ante una contradicción entre 10.0 y el resto, manda 10.0.

### 10.0 La impronta (lo que tiene que transmitir la primera pantalla)
- **Oscuro por defecto.** La app abre en modo oscuro siempre; el modo claro existe (Vidrio claro, 10.2) pero se elige a mano desde un botón y se recuerda. Un socio que abre el link en el celular tiene que ver esto: fondo grafito profundo que se apaga hacia Negro Medianoche, tarjetas de vidrio oscuro flotando encima, números grandes en Blanco Nieve, una línea de tendencia con brillo suave. **Monocromo Bankz: blanco y negro, sin verde.**
- **Fondo:** el grafito es el clima de toda la pantalla. Base `radial-gradient(85% 70% at 50% 28%, #1A2124 0%, #0E1315 38%, #05090A 62%, #030505 85%, #000000 100%)`, y encima las dos superficies curvas de 10.3 (la medianoche abajo a la izquierda, la grafito arriba a la derecha) con sus filos de luz. Una trama muy sutil de grilla (`1px` cada 48px, `rgba(255,255,255,.035)`) sobre el fondo, debajo de las tarjetas, como en la referencia; nunca encima del vidrio.
- **Tarjetas:** el vidrio oscuro de 10.4, pero más opaco y más negro que en TrackeAR, para que los números se lean sobre el fondo: `background:linear-gradient(180deg,rgba(14,16,16,.78) 0%,rgba(8,9,9,.86) 100%)`, `backdrop-filter:blur(28px) saturate(160%)`, filete superior `rgba(255,255,255,.14)`, radio 20–24px. Dentro de una tarjeta grande (por ejemplo "Dónde estamos") van **sub-tarjetas** más oscuras todavía (`rgba(0,0,0,.35)`, radio 16px, borde `rgba(255,255,255,.07)`): es la composición de la referencia, un panel que contiene widgets.
- **Paleta de datos (solo para gráficos y números), monocroma:** Blanco Nieve `#F9F9F9` para la serie principal y los números grandes; gris `#8C9497` para la serie secundaria; lo positivo (hecho, cobrado, delta a favor, "ahora") se marca en Blanco Nieve, peso 600 y con brillo `text-shadow: 0 0 26px rgba(249,249,249,.30)`, para separarlo del secundario gris; rojo `#FF3B30` solo para alertas (vencida, cobro atrasado). Texto corriente `#F5F5F7`, secundario `#A1A1A6`, rótulos `rgba(235,235,245,.82)`, líneas `rgba(235,235,245,.14)`. Nada de verde, azul, violeta, crema ni dorado.
- **Rótulo de sección:** arriba a la izquierda de cada pantalla, una palabra en mayúsculas, 11–12px, +0.18em de tracking, color Blanco Nieve al 70% ("SEGUIMIENTO", "TABLERO", "EMBUDO", "PLAN", "VENDEDORES", "ACUERDOS"); a la derecha, el nombre "Bankz" en el mismo estilo. Debajo, el título grande en Inter 700, 34–44px en celular y 56–64px en compu, tracking −0.04em, line-height 1.02, en dos líneas si hace falta ("Dónde\nestamos"). Un subtítulo en secundario, 15–16px, máximo dos líneas.
- **Anatomía del widget de KPI** (igual en todos): rótulo en mayúsculas 11px +0.08em secundario · número grande 34–40px Blanco Nieve, tabular, tracking −0.05em (la unidad o el "/ 999" a la mitad del tamaño, en secundario) · una línea chica de 12px con el delta contra la semana anterior: "+3 vs semana anterior" en Blanco Nieve con brillo si mejora, en secundario si empeora o no cambia; "sin dato previo" cuando no hay comparación. Los deltas se calculan de verdad (semana actual contra la anterior), no se decoran.
- **Gráficos:** líneas de 2px con curva suave (`monotone`), la serie principal en Blanco Nieve con un `drop-shadow(0 0 8px rgba(249,249,249,.35))`, la secundaria en gris `#8C9497` sin brillo; punto marcado en el último valor; grilla horizontal en `rgba(255,255,255,.06)`; eje X con etiquetas de semana (dd/mm) en 11px secundario; sin eje Y visible salvo tres marcas tenues. Un **anillo** (donut, trazo 10px, Blanco Nieve sobre `rgba(255,255,255,.08)`) para "cajas ocupadas sobre el punto de equilibrio" con el porcentaje adentro en 700 y una línea debajo ("En línea con el ritmo necesario" / "Por debajo del ritmo necesario", calculado). **Sparklines** de 6–8 semanas en las tablas por frente y por vendedor (columna "Tendencia", 72×20px, misma regla de color).
- **Tablas dentro de tarjetas:** encabezado en mayúsculas 11px +0.08em secundario, sin fondo; filas separadas por `1px rgba(235,235,245,.10)`; primera columna en 500 Blanco Nieve, números en tabular alineados a la derecha; sin zebra, sin bordes verticales.
- **Barra inferior de acción** en el celular (como el "Contactarnos" de la referencia): una franja de vidrio negro (Negro Medianoche translúcido) fija abajo con la acción principal de la pantalla ("Cargar semana", "Nuevo contrato", "Exportar informe") y una flecha a la derecha. En compu, la misma acción como tecla sólida arriba a la derecha.
- **Mucho aire igual que en Vidrio:** 16px de margen en celular, 24–32px en compu, 12–16px entre tarjetas; un solo título grande por pantalla.

### 10.1 Tipografía
- Inter de Google Fonts: `https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&display=swap`, con `font-optical-sizing:auto; -webkit-font-smoothing:antialiased`. Respaldo: -apple-system, "SF Pro Text", system-ui.
- Títulos: peso 700, letter-spacing −0.03em a −0.05em, line-height 1.05–1.1.
- Rótulos y texto secundario: peso 500–600, letter-spacing −0.01em a −0.02em.
- Números: `font-variant-numeric: tabular-nums`. Entero grande en 700 y −0.055em; decimales más chicos (la mitad del entero), peso 650.
- Rótulos chicos en mayúsculas: 12px, +0.04em. Sin itálicas. Una sola familia.

### 10.2 Colores
(El modo oscuro se define en 10.0 y manda sobre lo que sigue; lo de abajo es la base de Vidrio y el modo claro.)

Claro:
- Fondo base: `radial-gradient(75% 65% at 50% 42%, #FFFFFF 0%, #F8F8FA 42%, #F1F1F4 100%)`
- Texto #1D1D1F (títulos #0A0A0A) · secundario #636366 · terciario #8E8E93 · líneas rgba(60,60,67,.14)

Oscuro:
- Fondo base: `radial-gradient(75% 65% at 52% 50%, #0C0D0D 0%, #050505 55%, #000000 100%)`
- Texto #F5F5F7 · secundario #A1A1A6 · rótulos rgba(235,235,245,.82) · líneas rgba(235,235,245,.14)

Acento (sin color, monocromo Bankz): Blanco Nieve #F9F9F9 (oscuro) / Negro Medianoche #05090A (claro), peso 600, SOLO para lo positivo: hecho, contrato cobrado, "ahora", "esta semana". En oscuro lleva brillo: `text-shadow: 0 0 26px rgba(249,249,249,.30)`. Lo que no es positivo va en secundario gris, así el acento se distingue sin verde. Rojo #FF3B30 solo para alertas (acciones vencidas, contratos sin cobrar pasados 7 días). Nada de violeta ni azul.

### 10.3 Fondo (lo que el vidrio desenfoca)
Una capa fija detrás de todo (`position:fixed; inset:0; z-index:-1; overflow:hidden`) con dos círculos enormes que entran desde los bordes:
- **Superficie medianoche/nieve, abajo a la izquierda** (diámetro ~1,4 veces el ancho de pantalla, se ve solo su borde superior derecho).
- **Superficie grafito/perla, arriba a la derecha** (más chica, se ve su borde inferior izquierdo).

Rellenos (de la zona con luz hacia adentro):
- Claro: nieve `#D9DCDD → #E3E5E6 → #ECEDED → #F1F2F2`; perla `#EAEAEE → #E4E4E9 → #DDDDE2 → #D8D8DE`.
- Oscuro: medianoche `#1A2124 → #0E1315 → #05090A → #020303`; grafito `#1D1D20 → #121214 → #08080A → #030303`.

Cada superficie tiene un "filo" de luz en su borde: otro círculo igual encima, con `box-shadow` y `filter: blur(2.4px)`, y una máscara radial que lo apaga hacia los extremos (`mask: radial-gradient(60% 42% at 64% 9%, #000 0%, rgba(0,0,0,.8) 50%, transparent 100%)`):
- Claro, nieve: `inset 0 0 0 3px rgba(5,9,10,.55), inset 0 10px 64px rgba(5,9,10,.10), 0 0 44px rgba(5,9,10,.08)`
- Claro, perla: `inset 0 0 0 2.5px #FFFFFF, inset 0 -12px 60px rgba(255,255,255,.55), 0 0 30px rgba(0,0,0,.04)`
- Oscuro, medianoche: `inset 0 0 0 3px rgba(249,249,249,.85), inset 0 10px 70px rgba(249,249,249,.18), 0 0 56px rgba(249,249,249,.20)`
- Oscuro, grafito: `inset 0 0 0 2px rgba(255,255,255,.40), inset 0 -12px 64px rgba(255,255,255,.09), 0 0 40px rgba(255,255,255,.06)`

Reglas del fondo: las tarjetas pasan por encima del borde de las superficies (si no, el vidrio no tiene nada que desenfocar y se ve plano); nada de manchas de luz sueltas; el texto chico nunca encima de un filo.

### 10.4 Tarjeta de vidrio (widget de iOS)
Radio 22–28px; en Chrome sumá `corner-shape: superellipse(1.6)` para esquinas continuas.

Claro:
```css
.vidrio{position:relative;isolation:isolate;border-radius:24px;
  background:linear-gradient(180deg,rgba(255,255,255,.60) 0%,rgba(255,255,255,.38) 100%);
  -webkit-backdrop-filter:blur(24px) saturate(200%);backdrop-filter:blur(24px) saturate(200%);
  box-shadow:inset 0 1.5px 0 #FFFFFF, inset 0 -8px 18px rgba(255,255,255,.16),
             0 1px 2px rgba(0,0,0,.05), 0 6px 16px rgba(0,0,0,.05), 0 14px 30px rgba(0,0,0,.04);}
.vidrio::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;pointer-events:none;
  background:radial-gradient(90% 85% at 0% 100%,rgba(5,9,10,.05),rgba(5,9,10,0) 100%), /* sombra tenue adentro, abajo a la izquierda */
             linear-gradient(180deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.14) 30%,rgba(255,255,255,0) 50%),
             linear-gradient(115deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,0) 24%);}
.vidrio::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;padding:1.5px; /* filete que brilla arriba */
  background:linear-gradient(180deg,#FFFFFF 0%,rgba(255,255,255,.6) 30%,rgba(255,255,255,.4) 64%,rgba(255,255,255,.95) 100%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;}
```
Oscuro (mismas pseudo-capas, otros valores):
```css
background:linear-gradient(180deg,rgba(62,62,66,.40) 0%,rgba(30,30,33,.50) 100%);
backdrop-filter:blur(30px) saturate(170%);
box-shadow:inset 0 1px 1px rgba(255,255,255,.10), 0 2px 4px rgba(0,0,0,.30), 0 12px 26px rgba(0,0,0,.36), 0 30px 60px rgba(0,0,0,.50);
/* ::before */ radial-gradient(90% 85% at 0% 100%,rgba(249,249,249,.06),rgba(249,249,249,0)),
               linear-gradient(150deg,rgba(255,255,255,.13) 0%,rgba(255,255,255,.03) 24%,rgba(255,255,255,0) 40%),
               radial-gradient(90% 46% at 50% 0%,rgba(255,255,255,.06),rgba(255,255,255,0) 80%);
/* ::after (filete) */ radial-gradient(70% 120% at 0% 0%,rgba(255,255,255,.72) 0%,rgba(255,255,255,.22) 45%,rgba(255,255,255,0) 100%),
               radial-gradient(60% 90% at 100% 100%,rgba(255,255,255,.22) 0%,rgba(255,255,255,0) 100%), rgba(255,255,255,.05);
```
Listas dentro de una tarjeta: filas separadas por 1px de `--lineas`, con sangría a la izquierda como en iOS.

### 10.5 Botones y píldoras
- **Botón de vidrio** (claro): alto 44–52px, `border-radius:999px`, `background:linear-gradient(180deg,rgba(255,255,255,.40),rgba(255,255,255,.22))`, `backdrop-filter:blur(22px) saturate(200%)`, sombra `inset 0 1.5px 0 #FFF, inset 0 -1.5px 1px rgba(255,255,255,.55), inset 0 -10px 22px rgba(255,255,255,.18), 0 1px 2px rgba(0,0,0,.06), 0 10px 24px rgba(0,0,0,.08)`, reflejo en `::before`: `linear-gradient(180deg,rgba(255,255,255,.78) 0%,rgba(255,255,255,.22) 34%,transparent 52%), linear-gradient(115deg,rgba(255,255,255,.5) 0%,transparent 22%)`. El principal lleva un tinte gris adentro: `radial-gradient(60% 120% at 82% 70%,rgba(5,9,10,.10),transparent)`.
- **Tecla sólida** (acción principal, p. ej. "Exportar informe"): en claro, negra con brillo `linear-gradient(180deg,#2E2E31 0%,#141416 48%,#0A0A0A 100%)`, `inset 0 1.5px 0 rgba(255,255,255,.26)`, texto #F5F5F7. En oscuro, la inversa: `linear-gradient(180deg,#FFFFFF 0%,#F0F0F3 55%,#E2E2E7 100%)` con texto #0A0A0A.
- **Chips de estado**: pastilla de vidrio chica (12–13px, peso 600). Hecho = pastilla sólida invertida (Blanco Nieve con texto #05090A en oscuro; #05090A con texto #F9F9F9 en claro). Vencida = rojo. Pendiente / En curso / Trabado = neutros (gris, gris con punto, gris con guion).

### 10.6 Íconos y marca (esto es lo que cambia respecto de TrackeAR)
- Íconos de línea estilo SF Symbols en SVG inline: trazo 1.75–2, puntas redondeadas, #3A3A3C en claro y #E5E5EA en oscuro. Sin emojis.
- **Logo:** el isotipo de Bankz (la puerta de bóveda radial, 12 rayos alternados) dentro de un cuadrado con esquinas de ícono de iOS (radio 26% del lado). En claro, cuadrado #0A0A0A con el isotipo #F5F5F7; en oscuro, cuadrado #F5F5F7 con el isotipo negro. Sombra de ícono de app: `0 1px 2px rgba(0,0,0,.30), 0 8px 18px rgba(0,0,0,.25)`. Los archivos del isotipo y del logo horizontal están en el repo (`logo_dark.png`, `logo_white.png`; si hay SVG, mejor); si no los encontrás, pedilos.
- **Nombre en el encabezado:** "Bankz" en peso 600 + " Seguimiento" en gris #8E8E93.
- Pie de página de la app: "Estás seguro." en 600 y "Grupo Libertador Bahía S.A. · San Martín 133, Bahía Blanca" en terciario.

### 10.7 Movimiento
Transiciones de 160–240ms con ease-out; al tocar una tarjeta, `scale(.98)`; hover solo dentro de `@media (hover:hover)`; respetar `prefers-reduced-motion`.

### 10.8 Reglas
- Mucho aire: 16px de margen lateral en el celular y 24–32px en la compu; 12–16px entre tarjetas.
- Un solo título grande por pantalla; el resto en tarjetas de vidrio.
- Sin verde. Lo positivo, hecho o "ahora" se marca en Blanco Nieve (oscuro) / Negro Medianoche (claro) con peso 600; rojo solo para alertas.
- Contraste AA en todo el texto (por eso el secundario en claro es #636366).
- Prohibido: verde, crema, menta, dorado, degradés violeta/azul, vidrio sobre fondo plano (sin los arcos detrás no se nota), bordes gruesos, sombras duras, emojis, más de una tipografía.
- Tiene que verse bien a 375px de ancho, sin scroll horizontal (las tablas anchas, como el tablero semanal, scrollean dentro de su tarjeta con la primera columna fija).

### 10.9 Cómo se traduce a las pantallas de Bankz
- **Dónde estamos (inicio):** rótulo "SEGUIMIENTO", título "Dónde estamos" en dos líneas, subtítulo con la fecha ("Miércoles 14 de octubre · semana 3 del plan"). Debajo, **un panel de vidrio grande** que contiene: una fila de tres widgets de KPI (Cajas ocupadas "10 / 999", Contratos nuevos "2", Ritmo "2,0 / semana"), cada uno con su delta contra la semana anterior; luego una fila con el gráfico de líneas "Consultas y contratos por semana" (consultas en gris, contratos en Blanco Nieve) a la izquierda y el **anillo del punto de equilibrio** a la derecha ("12% · 10 de 80 cajas · Por debajo del ritmo necesario: 1,4 / semana"); luego la **tabla por frente** con columnas Frente · Consultas · Visitas · Contratos · Tendencia (sparkline). Fuera del panel, dos tarjetas más chicas: "Plan de acción" (hechas en Blanco Nieve, vencidas en rojo, barra fina) y "Lo que vence primero" (lista iOS con la fecha en tabular a la izquierda). Barra inferior: "Cargar la semana".
- **Tablero semanal:** rótulo "TABLERO", título "Semana a semana". Una tarjeta con la tabla (primera columna fija, scroll horizontal interno), la semana actual con un punto Blanco Nieve con brillo "ahora", celdas editables sin bordes, totales abajo. Arriba, tres KPI de la semana en curso con delta. Barra inferior: "Guardar" (si hay cambios sin guardar) o nada.
- **Embudo:** rótulo "EMBUDO". Un panel con el embudo dibujado (tres bandas horizontales de ancho proporcional, gris oscuro `#4A5255` › gris `#8C9497` › Blanco Nieve para contratos) y las conversiones en números grandes al costado; debajo, la tabla por frente con sparklines.
- **Plan de acción:** rótulo "PLAN". Tiles de avance por frente (hechas / total, barra fina Blanco Nieve). Una tarjeta por semana del plan con las acciones como filas iOS: tilde Blanco Nieve para las hechas (texto en secundario), "Vencida · 9 d" en rojo chico, chip de estado al tocar. Filtros como píldoras de vidrio.
- **Vendedores:** rótulo "VENDEDORES". KPI arriba (vendedores, contactos, visitas, contratos, comisiones pagadas). Lista iOS: código en Blanco Nieve tabular, nombre, contratos y comisión devengada a la derecha, sparkline de contactos; el detalle abre una hoja desde abajo en el celular y un panel lateral en la compu.
- **Acuerdos y prensa:** rótulo "ACUERDOS". Resumen por etapa como píldoras con número. Lista iOS con el nombre, el contacto en secundario y la etapa como chip; la etapa se cambia desde la hoja de detalle. Prensa igual, más abajo.
- **Registro de contratos:** rótulo "CONTRATOS". Lista por fecha con modelo, plan, origen y precio; alta desde la barra inferior "Nuevo contrato" en una hoja con los campos de 5.7.
- **Exportar informe:** tecla sólida arriba a la derecha en compu; en el celular, en la barra inferior de "Dónde estamos" junto a "Cargar la semana" (dos botones, el de exportar en vidrio).
- **Modo claro:** la misma composición con el Vidrio claro de 10.2 a 10.5 (nieve y perla, tarjetas blancas translúcidas, números en #05090A); se activa solo a mano.

---

## 11. Stack, autenticación y despliegue (recomendación; podés cambiar si justificás)

- **Next.js 15 (App Router, TypeScript, React Server Components + Server Actions)** desplegado en **Vercel**.
- **Base de datos:** Postgres. Manuel ya usa Supabase para la web de Bankz, así que **Supabase (Postgres) con acceso solo desde el servidor (service role, sin exponer claves al cliente)** es lo más simple; alternativa: Neon o Vercel Postgres. Migraciones versionadas en el repo (SQL o Drizzle). Sin ORM pesado si no hace falta.
- **Autenticación:** primera versión con **una contraseña compartida** definida en una variable de entorno (`APP_PASSWORD`), validada en un `middleware` que setea una cookie firmada (HttpOnly, Secure, SameSite=Lax, 30 días). En la primera entrada se pide también el nombre de quien usa la app (Manuel / José / hermano / Martina) y se guarda en la cookie para `updated_by`. Dejá el código listo para pasar a usuarios con roles (admin / carga / lectura) sin reescribir.
- **Edición:** guardado automático al salir de cada campo (debounce 500 ms), con indicador "Guardado / Guardando / Error" visible. Optimista en el cliente, server action atrás, `revalidatePath`.
- **PDF:** generar en el cliente con jsPDF + jspdf-autotable (ya probado en `tracker.html`), o en el servidor con `@react-pdf/renderer`; elegí uno y justificalo en el README.
- **Estilos:** CSS propio con tokens en `:root` (sin Tailwind, para que el CSS de vidrio quede literal como en la sección 10). Modo claro/oscuro por `prefers-color-scheme` con posibilidad de forzar desde un botón.
- **Celular primero.** Martina carga desde el teléfono.
- **Sin analytics, sin terceros, sin fuentes fuera de Google Fonts.** Variables de entorno documentadas en `.env.example`.
- **Repo:** `README.md` con cómo correr local, variables, migraciones, cómo cargar `seed.json`, y cómo desplegar en Vercel. Commits chicos y descriptivos en español.

---

## 12. Datos iniciales (van en `seed.json`; acá en forma legible para que entiendas qué es cada cosa)

### 12.1 Config
contratos_base 8 · fecha_base 2026-10-01 · base_redes 2 · base_referidos 6 · cajas_total 999 · parque {BKZ1 480, BKZ2 240, BKZ3 192, BKZ4 78, BKZ5 9} · eq_min 80 · eq_max 100 · eq_nota "Estimación preliminar de 80 a 100 cajas. El análisis de punto de equilibrio está en curso."

### 12.2 Acciones
Las 45 de la sección 3.6. Todas en estado `pendiente` salvo la 3 (`hecho`, fecha_hecho 2026-10-02). Responsables cargados solo donde el documento los tenía: 4 y 43 "Socios"; 10, 15, 26 y 36 "Cada socio". Fechas: `fecha_limite` es el último día del rango cuando hay rango ("06 al 08/10" → 2026-10-08; "13 al 16/10" → 2026-10-16); `rango_label` conserva el texto. 44 y 45 sin fecha, con `rango_label` "Diario" y "Lunes".

### 12.3 Vendedores
| Código | Vendedor | Nota |
|---|---|---|
| V01 | Tomás Santos |  |
| V02 | Coco |  |
| V03 | Cristian Haag |  |
| V04 | Daniel Burgos |  |
| V05 | Facundo Moreira |  |
| V06 | Cristian Munafo |  |
| V07 | Carolina Sánchez |  |
| V08 | Lucas Vera |  |
| V09 | Mónica (Intercambio Financiero) |  |
| V10 | Pullman |  |
| V11 | Francisco Cura |  |
| V12 | Cajeros ICBC | Un código por persona; a definir |
| V13 | Pedro Peñalva |  |
| V14 | César Lombardi |  |
| V15 | Mauricio Corpaz |  |
| V16 | Juan Comignani |  |
| V17 | María Rosa (Corporación) |  |
| V18 | Los Piro | Un código por persona; a definir |
| V19 | Faggiano |  |

### 12.4 Acuerdos
| Institución o empresa | Grupo | Contacto | Etapa | Nota |
|---|---|---|---|---|
| Cámara de Comercio e Industria | Institución |  | Sin contacto | Carta lista al 01/10 |
| Cámara Industrial Joven | Institución |  | Sin contacto | Carta lista al 01/10 |
| Bolsa de Comercio | Institución |  | Sin contacto | Carta lista al 01/10 |
| Colegio de Arquitectos | Institución |  | Sin contacto | Carta lista al 01/10 |
| Colegio de Escribanos | Institución | Moroco | Sin contacto | Carta lista al 01/10 |
| Colegio de Contadores | Institución |  | Sin contacto | Carta lista al 01/10 |
| Cámara de la Construcción | Institución |  | Sin contacto | Carta lista al 01/10 |
| Unión Industrial | Institución |  | Sin contacto | Carta lista al 01/10 |
| Asociación de Agencias de Viaje | Institución |  | Sin contacto | Carta lista al 01/10 |
| Cámara Arbitral de Cereales | Institución |  | Sin contacto | Carta lista al 01/10 |
| Consorcio de Gestión del Puerto | Institución |  | Sin contacto | Carta lista al 01/10 |
| Colegio de Martilleros | Institución | Carlos Esteban | Carta entregada | Carta entregada antes del 30/09 |
| Cámara de Desarrolladores Urbanos | Institución | Ruso Marini | Carta entregada | Carta entregada antes del 30/09 |
| Colegio de Abogados | Institución | Chiro | Sin contacto | En marcha; falta la carta |
| Corporación del Comercio | Institución | Pipo | Reunión o visita | Reunión hecha en septiembre |
| REMAX | Empresa |  | Reunión o visita | Primera reunión hecha; convenio con 20% y caja sin cargo pendiente de envío |
| Bahía Blanca Propiedades | Empresa |  | Reunión o visita | Primera reunión hecha; convenio pendiente de envío |
| UNO Bahía Club | Empresa |  | Reunión o visita | Primera reunión hecha; convenio pendiente de envío |

### 12.5 Prensa
| Medio | Estado | Nota |
|---|---|---|
| La Nueva | Sin contacto |  |
| La Brújula | Sin contacto |  |
| BHInfo | Sin contacto |  |
| Frente a Cano | Sin contacto |  |
| WIPS | Sin contacto |  |
| Entre Tazas y Café | Salida confirmada | Columna de Florín en La Nueva; el diario redacta la nota, Manuel manda los temas |
| Café x Medio | Sin contacto |  |

### 12.6 Semanas y contratos
Vacíos. Las semanas se crean solas desde la del 28/09/2026. No hay contratos individuales cargados: los 8 del inicio van por config.

---

## 13. Criterios de aceptación

1. Entro con la contraseña desde el celular y desde la compu; sin contraseña no se ve nada, ni el PDF.
2. En "Dónde estamos" veo 8 cajas ocupadas de 999, equilibrio 8 de 80–100, 1 de 45 acciones hechas y 28 vencidas al 14/10/2026 (si hoy es otra fecha, el número de vencidas cambia solo).
3. Cargo un contrato (BKZ 2, anual, origen vendedores, código V05, cobrado hoy): las cajas ocupadas pasan a 9, el tablero de la semana actual muestra 1 contrato en "vendedores", el frente 3 suma 1, V05 muestra 1 contrato y $96.000 devengados, y el PDF lo refleja.
4. Marco la acción 8 como hecha con fecha: deja de estar vencida, sube el contador de hechas, queda en el historial quién lo hizo.
5. Cambio la etapa de REMAX a "Convenio enviado": el resumen por etapa se actualiza y queda la fecha en el historial.
6. Exporto el informe: PDF A4 con el formato de la sección 9, pie en todas las páginas, numeración correcta, acentos bien, sin texto cortado.
7. A 375px de ancho no hay scroll horizontal de página; el tablero semanal scrollea dentro de su tarjeta.
8. Abre en modo oscuro con el fondo grafito profundo y las tarjetas de vidrio oscuro; el modo claro se activa a mano y se recuerda. En los dos, todo legible, el vidrio desenfoca las superficies del fondo, no aparece verde en ningún lado, lo positivo se marca en Blanco Nieve / Negro Medianoche y el rojo solo en alertas.
10. Cada KPI muestra el delta contra la semana anterior calculado de verdad; los gráficos de líneas, el anillo del equilibrio y las sparklines usan la paleta monocroma de 10.0 (Blanco Nieve / gris).
9. Nada en la app menciona proveedores de seguridad, bancos ni competidores; no hay ningún campo sobre el contenido de las cajas.

---

## 14. Preguntas para Manuel (hacelas al final, todas juntas, con tu propuesta por defecto)

1. ¿La caja de cortesía para instituciones es BKZ 2 o BKZ 3? (En el seed quedó vacío.)
2. ¿Qué descuento llevan los prescriptores directos? (No está en la oferta del 02/10.)
3. "Cajeros ICBC" y "Los Piro": ¿un código por persona? ¿Quiénes?
4. ¿Los 8 contratos del inicio los querés cargar uno por uno (modelo, plan, fecha) para tener ocupación por modelo desde el día uno?
5. ¿Una contraseña compartida alcanza para arrancar o querés un usuario por persona desde el principio?
6. ¿Dominio? (Propuesta: `seguimiento.bankz.ar`.)
7. ¿Responsables por frente y presupuestos por frente? (Acción 4 del plan.)

---

## 15. Qué no hacer

- No inventar datos, nombres, fechas ni montos. Vacío es mejor que falso.
- No agregar campos sobre el cliente que no estén en la sección 5.7.
- No meter emojis, ni exclamaciones, ni "lujo", ni dorados, ni degradés violeta/azul.
- No usar otra tipografía que Inter en la app ni otra que Helvetica en el PDF.
- No exponer claves al cliente. No dejar la app accesible sin contraseña ni un segundo.
- No integrar con el sistema de gestión ni con WhatsApp en esta versión.
- No reemplazar la estética Vidrio por un tema genérico de componentes.

Cuando termines la primera versión, dejá en el README un resumen de lo hecho, lo que quedó como `TODO(Manuel)` y las respuestas que necesitás.
