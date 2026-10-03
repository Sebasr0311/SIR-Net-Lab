# Guion de Exposición y Diapositivas: SIR-Net Lab

**Proyecto:** SIR-Net Lab — Laboratorio de Simulación Epidémica de Malware  
**Curso:** Ecuaciones Diferenciales Ordinarias (EDO) 2026-II  
**Tiempo Total de Exposición:** 10 – 12 minutos  
**Tiempo de Demostración en Vivo:** 4 minutos  
**Diapositivas:** 14 láminas

---

## Estructura Temporal de la Presentación (Cronograma)

| Bloque                                   | Diapositivas   | Minuto        | Contenido / Objetivo                                              |
| ---------------------------------------- | -------------- | ------------- | ----------------------------------------------------------------- |
| **1. Introducción y Motivación**         | Diapos 1 – 2   | 00:00 – 01:30 | Problema en ciberseguridad y justificación del modelado por EDOs  |
| **2. Marco Matemático y Deducciones**    | Diapos 3 – 5   | 01:30 – 04:00 | Modelo SIR/SEIR, deducción de $R_0$, integral primera y control   |
| **3. Métodos Numéricos y Validación**    | Diapo 6        | 04:00 – 05:00 | Solvers (Euler vs. RK4 vs. dopri5), orden de convergencia medido  |
| **4. Demostración en Vivo del Software** | Diapo 7        | 05:00 – 09:00 | Demo guiada paso a paso (Gusano, Umbral, Red BA, Hubs, Modo Reto) |
| **5. Redes, Calibración y Sensibilidad** | Diapos 8 – 11  | 09:00 – 10:30 | Gillespie en grafos, Nelder–Mead, Tornado y Monte Carlo LHS       |
| **6. Conclusiones y Defensa**            | Diapos 12 – 14 | 10:30 – 12:00 | Recomendaciones prescriptivas, limitaciones y ronda de preguntas  |

---

## Guion Detallado Diapositiva por Diapositiva

### Diapositiva 1: Portada y Planteamiento del Problema (00:00 – 00:45)

- **Título de la Diapositiva:** _SIR-Net Lab: Dinámica de Propagación de Malware mediante EDOs no Lineales y Redes Complejas._
- **Contenido Visual:** Logo del proyecto, captura de la interfaz en modo oscuro y diagrama conceptual de nodos interconectados transitando entre estados $S \to E \to I \to R$.
- **Qué decir (Locución):**
  > "Buenos días profesor y compañeros. Hoy presentamos **SIR-Net Lab**, una plataforma científica diseñada para modelar cuantitativamente la propagación de malware autónomo en redes computacionales. En el contexto de ciberseguridad actual, amenazas como gusanos y ransomware infectan miles de computadores en cuestión de minutos. Para los equipos de respuesta a incidentes, tomar decisiones a ciegas es inviable: se necesita predecir cuándo ocurrirá el pico de infección, cuántas máquinas se salvarán y cómo distribuir parches con presupuesto limitado. Nuestro objetivo fue modelar este fenómeno mediante sistemas de ecuaciones diferenciales ordinarias acoplados a teoría de redes complejas."

---

### Diapositiva 2: ¿Por qué EDOs en Ciberseguridad? (00:45 – 01:30)

- **Título:** _Analogía Epidemiológica y Justificación del Modelado Continuo._
- **Contenido Visual:** Tabla comparativa entre Huésped Biológico vs. Host Informático, gráfica del ciclo de vida de un incidente.
- **Qué decir (Locución):**
  > "¿Por qué modelar ciberseguridad con ecuaciones diferenciales? La interacción entre un computador infectado que escanea la red y equipos vulnerables es formalmente análoga a una epidemia biológica. Las EDOs nos permiten obtener soluciones e invariantes analíticos cerrados: el número reproductivo básico $R_0$, la cota máxima del desastre $I_{\max}$ y el umbral exacto de inmunidad colectiva. Esto no es solo una simulación gráfica: es un marco analítico riguroso con garantías matemáticas de conservación y estabilidad."

---

### Diapositiva 3: El Modelo SIR Base (Kermack–McKendrick) (01:30 – 02:15)

- **Título:** _Formulación del Sistema Compartimental SIR._
- **Contenido Visual:**
  $$\frac{dS}{dt} = -\frac{\beta S I}{N}, \quad \frac{dI}{dt} = \frac{\beta S I}{N} - \gamma I, \quad \frac{dR}{dt} = \gamma I$$
  Diagrama de flujo de cajas con tasas de transición, condición $S + I + R = N$.
- **Qué decir (Locución):**
  > "Partimos del modelo clásico de Kermack y McKendrick. Dividimos la red de $N$ hosts en tres compartimentos: Susceptibles $S$, Infectados activos $I$ y Removidos o parcheados $R$. La no linealidad fundamental reside en el término de contagio proporcional al producto $S \cdot I$. Sumando las tres derivadas verificamos que la tasa de cambio de la población total es idénticamente nula, lo que garantiza la conservación estricta de la masa en todo instante $t$."

---

### Diapositiva 4: Deducción de $R_0$, Umbral y la Integral Primera (02:15 – 03:15)

- **Título:** _Invariantes Matemáticos y el Plano de Fase $S\text{--}I$._
- **Contenido Visual:**
  - $R_0 = \beta / \gamma$, condición de brote $\left.\frac{dI}{dt}\right|_{0} > 0 \iff R_0 \frac{S_0}{N} > 1$.
  - Integral primera: $I(t) + S(t) - \frac{N}{R_0}\ln S(t) = C$.
  - Fórmula del pico analítico: $I_{\max} = I_0 + S_0 - \frac{N}{R_0}(1 + \ln(R_0 S_0 / N))$.
  - Ecuación trascendente de tamaño final: $\ln(S_\infty / S_0) = -(R_0/N)(N - S_\infty)$.
- **Qué decir (Locución):**
  > "El parámetro rector del sistema es el número reproductivo básico $R_0 = \beta / \gamma$. Si $R_0 \le 1$, la derivada de infectados es siempre negativa y la epidemia muere de raíz; si $R_0 > 1$, ocurre un brote epidémico. Al dividir $dI/dt$ entre $dS/dt$ e integrar analíticamente, deducimos la **integral primera del movimiento**: una constante que define las trayectorias exactas en el plano de fase $S\text{--}I$. A partir de ella encontramos de manera exacta el pico de infección $I_{\max}$ cuando $S = N/R_0$, y la ecuación trascendente que determina el número final de máquinas sobrevivientes $S_\infty$."

---

### Diapositiva 5: Extensión SEIR y Control por Impulsos (03:15 – 04:00)

- **Título:** _Modelo SEIR: Latencia de Malware y Campañas de Parcheo._
- **Contenido Visual:** Sistema SEIR con compartimento de latencia $E$, tasa de incubación $\sigma$, tasa profiláctica $\nu(t)$ y formulación de saltos en $t_k$: $S(t_k^+) = S(t_k^-)(1 - p_k)$. Cobertura crítica: $p_c = (1 - 1/R_0)/e$.
- **Qué decir (Locución):**
  > "En el mundo real el malware no se activa instantáneamente: existe un periodo de latencia donde se descifra la carga útil o se evaden defensas. Introducimos el compartimento $E$ con tasa de salida $\sigma$. Aunque la latencia no modifica $R_0$, sí retarda el pico de infección, otorgando una ventana táctica crucial a los defensores. Asimismo, deducimos la **cobertura crítica de parcheo** $p_c$: si logramos parchear una fracción $p \ge p_c$ antes del brote, inducimos inmunidad de rebaño y el malware no puede propagarse."

---

### Diapositiva 6: Métodos Numéricos y Orden de Convergencia (04:00 – 05:00)

- **Título:** _Solucionadores Numéricos: Euler, RK4 y Dormand–Prince._
- **Contenido Visual:**
  - Gráfica log-log de error global vs. tamaño de paso $h$.
  - Pendientes medidas: Euler ($p = 0.992 \approx 1$), RK4 ($p = 3.998 \approx 4$), dopri5 (adaptativo con error $< 10^{-8}$).
  - Benchmark analítico contra la solución logística de Verhulst ($\gamma = 0$).
- **Qué decir (Locución):**
  > "Para resolver el sistema programamos tres solucionadores en TypeScript estricto sobre `Float64Array`. Para demostrar que nuestros algoritmos son matemáticamente rigurosos y no cajas negras, medimos experimentalmente su orden de convergencia frente a la solución logística analítica. En escala log-log, la pendiente de Euler fue exactamente $1$ ($O(h^1)$), mientras que RK4 demostró una pendiente de $4$ ($O(h^4)$). Para simulaciones de precisión científica incluimos el método adaptativo Dormand–Prince dopri5 de 5.º orden, que ajusta automáticamente el paso de integración manteniendo el error por debajo de $10^{-8}$."

---

### Diapositiva 7: Demostración en Vivo del Simulador (05:00 – 09:00)

- **Acción:** Pasar al navegador en pantalla completa (tecla `F` para Modo Presentación).
- **Guion de la Demo (4 Minutos Exactos):**

#### Minuto 1 de Demo (05:00 – 06:00): Simulador EDO y Escenario Gusano Local

1. Seleccionar el escenario predeterminado **"Gusano de red local"** ($N = 1000, \beta = 0.6, \gamma = 0.2$).
2. Señalar el semáforo de $R_0 = 3.00$ en color rojo (alerta de brote).
3. Mostrar la coincidencia en vivo: el pico observado en la gráfica coincide exactamente con el KPI del pico analítico ($300$ máquinas infectadas en $t = 11.2$ días).
4. Hacer clic en el plano de fase $S\text{--}I$: demostrar que la órbita numérica respeta fielmente la curva de nivel de la integral primera.

#### Minuto 2 de Demo (06:00 – 07:00): El Teorema del Umbral y Parcheo Crítico

1. Deslizar el control de $\beta$ hacia la izquierda reduciéndolo a $0.15$ ($R_0 = 0.75 < 1$).
2. Mostrar cómo el semáforo cambia a verde: la curva de infectados cae monótonamente a cero sin generar ningún pico.
3. Volver a $\beta = 0.6$ y pasar a la pestaña **Control**: programar un impulso de parcheo preventivo con $p = 70\%$ en el día $t = 5$.
4. Observar el salto vertical instantáneo en $S(t)$ y $R(t)$ y cómo el brote queda totalmente neutralizado al superar la cobertura crítica $p_c = 66.7\%$.

#### Minuto 3 de Demo (07:00 – 08:00): Simulación en Red y Algoritmo de Gillespie

1. Cambiar a la vista **Red** y seleccionar topología **Barabási–Albert** ($n = 1000, m = 2$).
2. Ejecutar la simulación estocástica de Gillespie: destacar cómo el lienzo Canvas 2D renderiza los cambios de estado nodo a nodo en tiempo real a 60 FPS mediante un Web Worker secundario.
3. Activar el comparador **EDO vs. Red**: explicar por qué la EDO homogénea subestima la velocidad de propagación inicial en redes libres de escala debido al momento de segundo orden $\langle k^2 \rangle$.

#### Minuto 4 de Demo (08:00 – 09:00): Estrategias en Red y Modo Reto

1. En la tabla de estrategias pareadas, comparar **Parcheo Aleatorio** vs. **Parcheo Dirigido a Hubs** con el mismo presupuesto de 100 nodos ($10\%$).
2. Mostrar la evidencia: Parchear hubs reduce el tamaño final de ataque del $89\%$ al $12\%$.
3. Mostrar brevemente el **Modo Reto**: una interfaz interactiva donde el usuario gestiona un presupuesto de defensa en tiempo real contra un brote en curso.

---

### Diapositiva 8: Redes Complejas y Campo Medio por Grado (09:00 – 09:30)

- **Título:** _Heterogeneidad de Red: ¿Por qué la Mezcla Homogénea se Quiebra?_
- **Contenido Visual:**
  - Ecuación de campo medio heterogéneo: $dI_k/dt = \beta k (1 - I_k) \Theta - \gamma I_k$.
  - Umbral crítico en redes: $T_c = \frac{\langle k \rangle}{\langle k^2 \rangle - \langle k \rangle}$.
  - Demostración de que si $\langle k^2 \rangle \to \infty \implies T_c \to 0$ (Teorema de Pastor-Satorras & Vespignani).
- **Qué decir (Locución):**
  > "El supuesto de mezcla homogénea asume que todos los equipos tienen la misma probabilidad de contacto. En redes corporativas reales esto es falso. Aplicando campo medio por grado, deducimos que el umbral epidémico $T_c$ depende inversamente del segundo momento $\langle k^2 \rangle$. En redes libres de escala Barabási–Albert, donde existen servidores centrales masivamente conectados, $\langle k^2 \rangle$ es tan grande que el umbral epidémico desaparece: cualquier malware se propaga casi instantáneamente aprovechando los _hubs_."

---

### Diapositiva 9: Estrategias de Remediación en Redes (09:30 – 10:00)

- **Título:** _Parcheo Aleatorio vs. Hubs vs. Paradoja de la Amistad._
- **Contenido Visual:** Gráfica de barras comparativa del tamaño final de infección bajo presupuesto fijo del 10%:
  - Sin control: $89.4\%$
  - Aleatorio: $81.2\%$ (mejora de solo $9\%$)
  - Inmunización de vecinos: $45.8\%$ (mejora de $49\%$)
  - Dirigido a Hubs: $12.4\%$ (mejora del $86\%$).
- **Qué decir (Locución):**
  > "Esto nos lleva a una conclusión táctica de enorme relevancia práctica: bajo un presupuesto idéntico del 10% de parches, vacunar nodos al azar apenas reduce el ataque en un 9%. Pero si aplicamos una estrategia dirigida a los nodos de mayor grado topológico (_hubs_), el ataque se reduce en un 86%. Además, si no conocemos la topología completa de la red, la estrategia de 'vacunar a un vecino al azar' aprovecha la paradoja matemática de la amistad para capturar nodos de alto grado sin necesidad de mapear toda la infraestructura."

---

### Diapositiva 10: Calibración Inversa e Incertidumbre (10:00 – 10:30)

- **Título:** _Estimación no Lineal (Nelder–Mead) y Bootstrap Residual._
- **Contenido Visual:**
  - Ajuste de curva del modelo sobre datos ruidosos ($R^2 = 0.994$).
  - Superficie de costo 2D $J(\beta, \gamma)$ mostrando la correlación e identificabilidad.
  - Histogramas de intervalos de confianza al 95% calculados por $200$ réplicas bootstrap.
- **Qué decir (Locución):**
  > "Para conectar el modelo con incidentes reales, implementamos calibración inversa mediante optimización simplex Nelder–Mead acotada. A partir de los reportes diarios de hosts infectados, el algoritmo estima de forma robusta $\beta$ y $\gamma$. Mediante $200$ réplicas de bootstrap residual cuantificamos la incertidumbre muestral y demostramos la correlación entre contagio y recuperación en la superficie de costo 2D."

---

### Diapositiva 11: Sensibilidad Local y Global (LHS Monte Carlo) (10:30 – 11:00)

- **Título:** _Análisis de Sensibilidad: Diagrama de Tornado y Muestreo LHS._
- **Contenido Visual:**
  - Diagrama de tornado de derivadas normalizadas para $S_\infty, I_{\max}, R_0$.
  - Muestreo estratificado por Hipercubo Latino ($M = 1000$ réplicas en Web Worker).
  - Mapa de calor 2D $I_{\max}(\beta, \gamma)$ con la hipérbola analítica $R_0 = 1$.
- **Qué decir (Locución):**
  > "El análisis de sensibilidad local mediante derivadas normalizadas revela que la tasa de contagio $\beta$ ejerce la mayor elasticidad sobre la red: reducir $\beta$ en un 1% mediante segmentación incrementa los equipos salvados en casi un 3%. Finalmente, el análisis global con 1000 muestras por Hipercubo Latino y el barrido 2D validan la transición de fase exacta a lo largo de la hipérbola $R_0 = 1$."

---

### Diapositiva 12: Conclusiones y Recomendaciones para CSIRTs (11:00 – 11:30)

- **Título:** _Conclusiones Principales y Guía Prescriptiva._
- **Contenido Visual:** Lista sintetizada de aportes matemáticos y operacionales.
- **Qué decir (Locución):**
  > "En conclusión:
  >
  > 1. Las EDOs no lineales proporcionan un marco analítico exacto y predictivo para la dinámica de malware.
  > 2. El umbral $R_0 = 1$ rige estrictamente la viabilidad del brote, y la cobertura crítica $p_c$ marca el objetivo mínimo para detenerlo antes del pico.
  > 3. En redes complejas, la topología domina sobre la tasa de contagio: en presencia de _hubs_, el parcheo dirigido es casi un orden de magnitud superior al parcheo uniforme.
  > 4. La herramienta está disponible en línea, con código abierto y documentación académica completa."

---

### Diapositiva 13: Limitaciones y Trabajo Futuro (11:30 – 11:50)

- **Título:** _Limitaciones del Estudio y Extensiones Futuras._
- **Contenido Visual:**
  - Supuestos de invariancia temporal en tasas.
  - Redes multicapa y aislamiento dinámico de enlaces.
  - Formulación de control óptimo continuo mediante el principio del máximo de Pontryagin.
- **Qué decir (Locución):**
  > "Como limitaciones, asumimos topologías fijas y tasas independientes del tiempo. En futuras extensiones implementaremos control óptimo mediante el principio de Pontryagin para derivar trayectorias continuas de inversión presupuestaria y modelos de juegos diferenciales atacante-defensor."

---

### Diapositiva 14: Preguntas y Respuestas (11:50 – 12:00+)

- **Título:** _Ronda de Preguntas y Discusión._
- **Contenido Visual:** Enlace al demostrador público, código QR al repositorio GitHub y agradecimientos institucionales.
- **Qué decir (Locución):**
  > "Muchas gracias por su atención. Quedamos a disposición del profesor y la audiencia para responder cualquier duda técnica o matemática sobre el modelo y la plataforma."

---

## Banco de Preguntas Anticipadas del Profesor y Respuestas Preparadas

### P1: ¿Por qué utilizar un sistema continuo de EDOs si los computadores y las redes son entidades discretas?

> **Respuesta:**  
> "Las EDOs proporcionan soluciones e invariantes analíticos globales ($R_0$, $I_{\max}$, $S_\infty$, la integral primera y la cobertura crítica $p_c$) que no pueden deducirse analíticamente a partir de una simulación puramente discreta. Además, cuando la población $N$ crece hacia miles o millones de nodos, el teorema del límite central y la aproximación de campo medio hacen que las ecuaciones diferenciales describan con extrema precisión la esperanza matemática del proceso estocástico, como demostramos en la comparación con el algoritmo de Gillespie sobre grafos completos ($RMSE < 1.84\%$). Las EDOs ofrecen velocidad instantánea para exploración de escenarios, mientras que el modelo en red valida los límites de esa aproximación."

---

### P2: ¿Cómo se deduce rigurosamente que el pico de infectados ocurre exactamente cuando $S = N/R_0$?

> **Respuesta:**  
> "A partir de la ecuación diferencial de infectados $\frac{dI}{dt} = \frac{\beta S I}{N} - \gamma I = I \left( \frac{\beta S}{N} - \gamma \right)$. Para que $I(t)$ alcance un extremo relativo en el interior del dominio temporal, su derivada temporal debe anularse con $I > 0$. Igualando el término entre paréntesis a cero: $\frac{\beta S}{N} - \gamma = 0 \implies S = \frac{\gamma N}{\beta} = \frac{N}{\beta / \gamma} = \frac{N}{R_0}$. Dado que $S(t)$ es una función monótonamente decreciente, la derivada segunda de $I$ en ese punto es negativa, confirmando que se trata de un máximo absoluto del brote."

---

### P3: ¿Por qué en una red libre de escala (Barabási–Albert) el umbral epidémico tiende a cero?

> **Respuesta:**  
> "Bajo la teoría de campo medio heterogéneo por grado de Pastor-Satorras y Vespignani, el umbral crítico para el modelo SIR es $T_c = \frac{\langle k \rangle}{\langle k^2 \rangle - \langle k \rangle}$. En redes con distribución de conectividad en ley de potencia $P(k) \sim k^{-\gamma_{\text{pl}}}$ con $2 < \gamma_{\text{pl}} \le 3$, el momento de segundo orden $\langle k^2 \rangle$ diverge cuando el tamaño de la red tiende a infinito ($N \to \infty$). Al ser el denominador arbitrariamente grande, $T_c \to 0$. Esto significa que basta una tasa de contagio infinitesimalmente pequeña para que los nodos altamente conectados (_hubs_) se infecten y retransmitan el malware hacia todas las ramas de la red."

---

### P4: ¿Por qué el método clásico de Runge–Kutta (RK4) es superior a Euler para esta simulación?

> **Respuesta:**  
> "Euler explícito acumula un error de truncamiento global de orden $O(h^1)$, lo que exige pasos de tiempo minúsculos para no distorsionar las trayectorias no lineales y puede provocar inestabilidades numéricas artificiales. RK4, mediante su combinación lineal de cuatro evaluaciones intermedias de pendientes, cancela los términos de las series de Taylor hasta el cuarto orden, logrando un error de orden $O(h^4)$. En nuestras pruebas de convergencia log-log, reducir el paso $h$ en un factor de 10 reduce el error de Euler por 10, pero reduce el error de RK4 por $10000$, permitiendo simulaciones rápidas y numéricamente estables."

---

### P5: En la calibración por mínimos cuadrados, ¿por qué observaron un valle alargado en la superficie de costo entre $\beta$ y $\gamma$?

> **Respuesta:**  
> "Ese valle refleja un fenómeno clásico de **identificabilidad práctica**: el número reproductivo $R_0 = \beta / \gamma$ fija la curvatura general y la fracción final infectada. Si aumentamos simultáneamente la tasa de contagio $\beta$ y la tasa de recuperación $\gamma$ en proporciones similares, la relación $\beta / \gamma$ permanece casi constante. Aunque la escala de tiempo temporal se comprime ligeramente, la forma general de la curva de infectados activos presenta una sensibilidad atenuada, generando una correlación empírica superior a $0.85$ entre ambos parámetros en el estimador."
