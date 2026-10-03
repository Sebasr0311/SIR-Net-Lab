# SIR-Net Lab: Modelado Matemático de Propagación de Malware en Redes Complejas Mediante Sistemas de Ecuaciones Diferenciales no Lineales y Simulación Estocástica

**Asignatura:** Ecuaciones Diferenciales Ordinarias (EDO)  
**Semestre:** 2026-II  
**Institución:** Facultad de Ingeniería de Sistemas e Informática  
**Autores:** Equipo de Investigación SIR-Net Lab  
**Repositorio Oficial:** [https://github.com/Sebasr0311/SIR-Net-Lab](https://github.com/Sebasr0311/SIR-Net-Lab)  
**Demostrador Web Interactivo:** [https://sebasr0311.github.io/SIR-Net-Lab/](https://sebasr0311.github.io/SIR-Net-Lab/)  
**Fecha de Entrega:** Octubre de 2026

---

## Resumen

El presente informe expone el diseño, formalización analítica, resolución numérica y validación experimental de una plataforma integral de modelado epidemiológico aplicado a la propagación de malware en infraestructuras informáticas. Se formula el sistema dinámico compartimental SIR clásico de Kermack–McKendrick acoplado a la extensión SEIR con latencia de ejecución y políticas de parcheo preventivo continuo e impulsivo. Se deducen analíticamente el número reproductivo básico $R_0$, la integral primera del movimiento en el espacio de fases $S\text{--}I$, el pico máximo de infección $I_{\max}$ y la ecuación trascendente del tamaño final de ataque $S_\infty$. Asimismo, se trasciende la hipótesis clásica de mezcla homogénea mediante el formalismo de campo medio heterogéneo por grado sobre redes complejas (Erdős–Rényi, Watts–Strogatz y Barabási–Albert), contrastando las trayectorias continuas frente a realizaciones del algoritmo estocástico de saltos de Gillespie. Se implementan métodos numéricos de un paso (Euler, Runge–Kutta clásico RK4 y Dormand–Prince dopri5 de paso adaptativo), midiendo sus órdenes de convergencia formal. Finalmente, se integran procedimientos de calibración no lineal por Nelder–Mead acotado con bootstrap residual ($B = 200$), análisis de sensibilidad local (diagramas de tornado) y global (muestreo por Hipercubo Latino con $M = 1000$ réplicas Monte Carlo), demostrando cuantitativamente que en redes libres de escala la inmunización dirigida a _hubs_ colapsa el brote con un tercio del presupuesto requerido por estrategias aleatorias.

**Palabras clave:** Ecuaciones diferenciales ordinarias no lineales; Modelos compartimentales; Malware epidemiológico; Redes complejas; Algoritmo de Gillespie; Calibración inversa; Sensibilidad global; Control por impulsos.

---

## Abstract

This paper presents the formal analytical derivation, numerical solution, and empirical validation of a comprehensive computational framework for modeling malware contagion dynamics across complex computer networks. Beginning with the classical Kermack–McKendrick SIR non-linear dynamical system, we introduce the SEIR extension incorporating an exposed (latent) quarantine compartment and continuous/impulsive preventive patching interventions. Key analytical invariants are derived, including the basic reproduction number $R_0$, the first integral of motion in the $S\text{--}I$ phase plane, the peak epidemic threshold $I_{\max}$, and the transcendental final size relation for $S_\infty$. To overcome the limitations of the homogeneous mixing assumption, we establish degree-based heterogeneous mean-field equations across complex network topologies (Erdős–Rényi, Watts–Strogatz, and Barabási–Albert scale-free graphs) and benchmark the deterministic differential curves against exact continuous-time Markov stochastic trajectories simulated via Gillespie's Direct Method. High-order numerical solvers (Euler, RK4, and adaptive Dormand–Prince dopri5) are verified through empirical convergence order tests. In addition, parameter estimation via constrained Nelder–Mead optimization, non-parametric residual bootstrap uncertainty quantification ($B = 200$), local sensitivity tornado charts, and Latin Hypercube Sampling (LHS) Monte Carlo exploration ($M = 1000$) demonstrate that targeted hub immunization in scale-free corporate topologies eradicates outbreaks at substantially lower costs than random uniform patching.

**Keywords:** Non-linear ordinary differential equations; Compartmental models; Malware epidemics; Complex networks; Gillespie algorithm; Parameter calibration; Global sensitivity analysis; Impulsive control.

---

## Índice General

1. **Planteamiento del Problema**
   - 1.1 Contexto de ciberseguridad y propagación autónoma
   - 1.2 Analogía biológico-epidemiológica vs. ciberseguridad
   - 1.3 Variables de estado y compartimentos del sistema
   - 1.4 Hipótesis y supuestos fundamentales
   - 1.5 Objetivos generales y específicos
2. **Formulación del Modelo Matemático**
   - 2.1 Deducción del modelo SIR base de Kermack–McKendrick
   - 2.2 Deducción del número reproductivo básico $R_0$ y condición de umbral
   - 2.3 Modelo extendido SEIR con latencia y parcheo profiláctico
   - 2.4 Integral primera y geometría del plano de fase $S\text{--}I$
   - 2.5 Modelo en redes complejas: Campo medio heterogéneo por grado y umbral $T_c$
3. **Solución Analítica y Métodos Numéricos**
   - 3.1 Puntos de equilibrio y estabilidad local (Análisis del Jacobiano)
   - 3.2 Deducción del pico epidémico analítico $I_{\max}$
   - 3.3 Ecuación trascendente del tamaño final de infección $S_\infty$
   - 3.4 Caso límite analítico: Solución logística de Verhulst ($\gamma = 0$)
   - 3.5 Algoritmos numéricos: Euler explícito, RK4 clásico y Dormand–Prince dopri5
   - 3.6 Medición empírica del orden de convergencia numérico
   - 3.7 Simulación estocástica exacta: Algoritmo de Gillespie en grafos
4. **Validación Experimental, Calibración y Análisis de Sensibilidad**
   - 4.1 Batería de validación formal y conservación de masa
   - 4.2 Calibración no lineal inversa: Algoritmo simplex Nelder–Mead
   - 4.3 Cuantificación de incertidumbre e identificabilidad mediante Bootstrap residual
   - 4.4 Análisis de sensibilidad local normalizada (Diagrama de tornado)
   - 4.5 Análisis de sensibilidad global por Hipercubo Latino (LHS) y Monte Carlo
   - 4.6 Barrido bidimensional y transición de fase transcrítica en $R_0 = 1$
5. **Interpretación Práctica, Estrategias de Contención y Recomendaciones**
   - 5.1 Umbral y cobertura crítica de vacunación/parcheo ($p_c$)
   - 5.2 Control por campañas de impulsos discretos
   - 5.3 Efectividad comparativa de estrategias en red: Aleatoria vs. Hubs vs. Vecinos
   - 5.4 Limitaciones del modelo y trabajo futuro
6. **Conclusiones**
7. **Referencias Bibliográficas**
8. **Anexos**
   - Anexo A: Arquitectura de software y flujo de ejecución en Web Workers
   - Anexo B: Guía de uso y reproducibilidad del demostrador web
   - Anexo C: Tabla comparativa de escenarios de referencia

---

## 1. Planteamiento del Problema

### 1.1 Contexto de ciberseguridad y propagación autónoma

Las amenazas cibernéticas modernas —tales como gusanos de escaneo autónomo de subredes (ej. _WannaCry_, _Mirai_, _Code Red_), ransomware multietapa y botnets distribuidas— exhiben dinámicas de dispersión que se propagan a escala global en cuestión de horas o minutos. La interconexión masiva de estaciones de trabajo, servidores e instancias en la nube crea vectores de ataque donde la vulnerabilidad de un host individual puede comprometer la resiliencia de infraestructuras corporativas y gubernamentales enteras.

La toma de decisiones de los equipos de respuesta a incidentes (CSIRT/SOC) no puede sustentarse en conjeturas cualitativas: la determinación de ventanas críticas de aislamiento, la asignación de presupuestos limitados de remediación y la priorización de parches requieren modelos matemáticos rigurosos y herramientas cuantitativas capaces de anticipar la curva de infección y cuantificar el impacto de cada contramedida.

### 1.2 Analogía biológico-epidemiológica vs. ciberseguridad

Desde los trabajos seminales de Kephart y White (1991), se ha consolidado la analogía formal entre la epidemiología matemática y la dinámica de propagación de software malicioso. Las correspondencias esenciales se sintetizan en la **Tabla 1**:

#### Tabla 1. Correspondencia formal entre epidemiología médica y ciberseguridad

| Concepto Biológico                | Equivalente en Ciberseguridad                                      | Parámetro Matemático / Significado                                 |
| --------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Huésped susceptible ($S$)         | Equipo o nodo desactualizado vulnerable al exploit                 | Fracción o número de nodos expuestos a la amenaza                  |
| Huésped expuesto/latente ($E$)    | Equipo infectado durante descarga, descifrado o bypass de EDR      | Periodo de latencia $1/\sigma$ antes del escaneo activo            |
| Huésped infectado activo ($I$)    | Servidor o estación ejecutando escaneo de puertos y propagación    | Tasa de transmisión efectiva $\beta$                               |
| Huésped recuperado/removido ($R$) | Dispositivo parcheado, aislado en VLAN o con firma IPS actualizada | Tasa de remoción $\gamma$ (tiempo medio de remediación $1/\gamma$) |
| Tasa de contacto / contagio       | Frecuencia de sondas de red y éxito de autenticación               | $\beta$ (contactos efectivos por nodo y unidad de tiempo)          |
| Inmunización / Vacunación         | Despliegue automatizado de parches de seguridad de software        | Tasa profiláctica $\nu(t)$ o cobertura por impulso $p_k$           |
| Pérdida de inmunidad              | Reversión de configuraciones o mutación polimórfica del malware    | Tasa de reinfección $\omega$ (modelo SEIS)                         |

### 1.3 Variables de estado y compartimentos del sistema

El espacio de estados del sistema continuo en cualquier instante de tiempo $t \ge 0$ se define mediante el vector de estado $\mathbf{y}(t) \in \mathbb{R}_+^4$:

- $S(t)$: Número de computadores susceptibles a la infección.
- $E(t)$: Número de nodos expuestos (con carga maliciosa latente en memoria pero que aún no transmiten hacia otros nodos).
- $I(t)$: Número de computadores activos que escanean activamente y propagan el vector de ataque.
- $R(t)$: Número de nodos removidos (parcheados, inmunes o desconectados permanentemente de la red).

La población total de la red se denota por $N$.

### 1.4 Hipótesis y supuestos fundamentales

Para garantizar la tratabilidad analítica del sistema de ecuaciones diferenciales deterministas se adoptan los siguientes postulados:

1. **Conservación de la población (Red cerrada):** Durante el horizonte temporal del incidente no hay incorporación ni retiro definitivo de equipos de la infraestructura, de modo que:
   $$\frac{dN}{dt} = \frac{d}{dt}(S(t) + E(t) + I(t) + R(t)) = 0 \implies S(t) + E(t) + I(t) + R(t) \equiv N$$
2. **Mezcla homogénea (_Homogeneous Mixing_):** En el modelo base continuo, se asume que cada máquina en la red tiene una probabilidad uniforme de interactuar con cualquier otra máquina (tasa de contacto proporcional a la densidad de infectados $I/N$). En la Sección 2.5 esta hipótesis se relaja mediante la formulación sobre grafos complejos.
3. **Proceso sin memoria (Tasas constantes por compartimento):** Las transiciones entre compartimentos siguen distribuciones de tiempo de residencia exponenciales con parámetros constantes $(\beta, \sigma, \gamma, \nu)$.

### 1.5 Objetivos generales y específicos

- **Objetivo General:** Formular, analizar y validar computacionalmente un marco dinámico fundamentado en EDOs no lineales y teoría de redes complejas para caracterizar la propagación de malware y optimizar estrategias defensivas.
- **Objetivos Específicos:**
  1. Deducir rigurosamente las ecuaciones de balance del modelo SIR/SEIR continuo, sus invariantes analíticos (integral primera, pico epidémico, tamaño final) y condiciones de bifurcación de $R_0$.
  2. Implementar integradores numéricos de alto orden (Euler, RK4, Dormand–Prince dopri5) en TypeScript estricto con Web Workers y verificar analíticamente sus órdenes de convergencia.
  3. Formalizar el modelo estocástico de saltos mediante el algoritmo de Gillespie sobre grafos Erdős–Rényi, Watts–Strogatz y Barabási–Albert, evaluando el rol de la heterogeneidad de grado $\langle k^2 \rangle$.
  4. Proveer rutinas de estimación no lineal inversa (Nelder–Mead) con remuestreo bootstrap e inferencia de sensibilidad local y global (LHS Monte Carlo).
  5. Cuantificar el umbral crítico de parcheo $p_c$ y demostrar la superioridad matemática de las estrategias dirigidas a _hubs_ en redes corporativas libres de escala.

---

## 2. Formulación del Modelo Matemático

### 2.1 Deducción del modelo SIR base de Kermack–McKendrick

Consideremos una población homogénea de $N$ hosts. El número total de contactos por unidad de tiempo que un nodo susceptible $S$ experimenta con otros nodos es proporcional a la conectividad de la red. Si una fracción $I/N$ de los contactos es con nodos infectados, y cada contacto tiene una probabilidad de transmisión exitosa por unidad de tiempo de $\beta$, el flujo neto de nodos de $S$ hacia $I$ en un intervalo infinitesimal $\Delta t$ es:
$$\Delta S \to I = \beta S(t) \frac{I(t)}{N} \Delta t$$

Simultáneamente, los nodos infectados son detectados y remediados por los sistemas de defensa a una tasa constante $\gamma > 0$, de tal modo que la probabilidad de recuperación en $[t, t + \Delta t]$ es $\gamma \Delta t$. Por balance poblacional diferencial:

$$ \begin{aligned}
\frac{dS}{dt} &= -\frac{\beta S I}{N} \quad &\text{[Ecuación 1a]} \\
\frac{dI}{dt} &= \frac{\beta S I}{N} - \gamma I \quad &\text{[Ecuación 1b]} \\
\frac{dR}{dt} &= \gamma I \quad &\text{[Ecuación 1c]}
\end{aligned}$$

Sumando las tres expresiones de la [Ecuación 1]:
$$\frac{dS}{dt} + \frac{dI}{dt} + \frac{dR}{dt} = -\frac{\beta S I}{N} + \left(\frac{\beta S I}{N} - \gamma I\right) + \gamma I = 0$$
lo cual demuestra la estricta conservación de la masa poblacional en todo tiempo $t \ge 0$.

### 2.2 Deducción del número reproductivo básico $R_0$ y condición de umbral
El número reproductivo básico $R_0$ representa el número medio de infecciones secundarias que un solo host infectado ($I_0 = 1$) es capaz de generar a lo largo de todo su periodo infeccioso dentro de una población enteramente susceptible ($S(0) \approx N$).

Dado que la tasa de recuperación es $\gamma$, el tiempo que un nodo permanece en el estado infeccioso sigue una variable aleatoria exponencial $T_{\text{inf}} \sim \text{Exp}(\gamma)$, cuya esperanza matemática es:
$$\mathbb{E}[T_{\text{inf}}] = \frac{1}{\gamma}$$

Durante este periodo medio, el host genera transmisiones a una tasa $\beta \frac{S(0)}{N} \approx \beta$. Por consiguiente:
$$R_0 = \beta \cdot \mathbb{E}[T_{\text{inf}}] = \frac{\beta}{\gamma} \quad \text{[Ecuación 2]}$$

Examinemos la condición para que exista un brote epidémico inicial. Derivando la [Ecuación 1b] evaluada en $t = 0$:
$$\left.\frac{dI}{dt}\right|_{t=0} = \left(\frac{\beta S(0)}{N} - \gamma\right) I(0) = \gamma \left( R_0 \frac{S(0)}{N} - 1 \right) I(0)$$

Dado que $\gamma > 0$ e $I(0) > 0$, el crecimiento inicial de la infección ($\left.\frac{dI}{dt}\right|_{t=0} > 0$) exige estrictamente:
$$R_0 \frac{S(0)}{N} > 1 \iff R_{\text{ef}}(0) > 1 \quad \text{[Ecuación 3]}$$
donde $R_{\text{ef}}(t) = R_0 \frac{S(t)}{N}$ es el **número reproductivo efectivo**. Si $R_0 \le 1$, la derivada es negativa o nula para todo $t \ge 0$, garantizando que la infección decrece monótonamente hacia la extinción sin alcanzar nunca un pico secundario.

### 2.3 Modelo extendido SEIR con latencia y parcheo profiláctico
En ataques cibernéticos modernos, el malware suele tener una fase de letargo (instalación silenciosa, bypass de antivirus o descifrado de comandos C2). Adicionalmente, los administradores aplican parches preventivos a nodos susceptibles antes de que sean alcanzados por el vector de ataque. Formalizamos el sistema continuo **SEIR con control**:

$$\begin{aligned}
\frac{dS}{dt} &= -\beta(t) \frac{S I}{N} - \nu(t) S \quad &\text{[Ecuación 4a]} \\
\frac{dE}{dt} &= \beta(t) \frac{S I}{N} - \sigma E \quad &\text{[Ecuación 4b]} \\
\frac{dI}{dt} &= \sigma E - \gamma I \quad &\text{[Ecuación 4c]} \\
\frac{dR}{dt} &= \gamma I + \nu(t) S \quad &\text{[Ecuación 4d]}
\end{aligned}$$

Donde:
- $\sigma$: Tasa de transición del estado latente al infeccioso (tiempo medio de incubación $\tau_{\text{lat}} = 1/\sigma$).
- $\nu(t) \ge 0$: Tasa de despliegue de parches preventivos sobre hosts susceptibles.
- $\beta(t) = \beta_0 (1 - c \cdot u(t))$: Tasa de contagio modulada por aislamiento dinámico de puertos o microsegmentación de red, donde $u(t) \in [0, 1]$ es la intensidad del control y $c \in [0, 1]$ su eficacia de contención.

Nótese que la introducción del compartimento $E$ no altera el valor del número reproductivo básico $R_0 = \beta / \gamma$, ya que cada nodo que ingresa a $E$ transita eventualmente hacia $I$ (la probabilidad de transición es 1 en ausencia de mortalidad de hosts). No obstante, la latencia introduce una inercia dinámica que amortigua y retrasa el instante del pico epidémico $t_{\text{pico}}$.

### 2.4 Integral primera y geometría del plano de fase $S\text{--}I$
Una propiedad fundamental del sistema no lineal SIR ([Ecuación 1]) es que admite una reducción de orden mediante la regla de la cadena. Dividiendo la [Ecuación 1b] entre la [Ecuación 1a]:

$$\frac{dI}{dS} = \frac{\frac{\beta S I}{N} - \gamma I}{-\frac{\beta S I}{N}} = -1 + \frac{\gamma N}{\beta S} = -1 + \frac{N}{R_0 S} \quad \text{[Ecuación 5]}$$

Esta ecuación diferencial ordinaria de primer orden en variables separables puede integrarse de forma exacta:
$$dI = \left(-1 + \frac{N}{R_0 S}\right) dS \implies \int dI = -\int dS + \frac{N}{R_0} \int \frac{dS}{S}$$

$$I(t) + S(t) - \frac{N}{R_0} \ln S(t) = C \quad \text{[Ecuación 6]}$$
donde $C$ es una constante del movimiento determinada por las condiciones iniciales:
$$C = I_0 + S_0 - \frac{N}{R_0} \ln S_0$$

La [Ecuación 6] define las órbitas o trayectorias en el espacio de fases $S\text{--}I$. En la plataforma **SIR-Net Lab**, este invariante es verificado de manera continua: al hacer clic sobre cualquier coordenada del plano de fase, el integrador numérico genera una curva cuya desviación cuadrática respecto a la curva teórica de nivel $C$ se mantiene por debajo de $10^{-6}$.

### 2.5 Modelo en redes complejas: Campo medio heterogéneo por grado y umbral $T_c$
En redes computacionales reales, los computadores no interactúan uniformemente. Un conmutador central, un controlador de dominio (*Active Directory*) o un servidor de bases de datos posee miles de conexiones incidentes, mientras que una estación de usuario final posee un grado topológico reducido.

Sea un grafo $G = (V, E)$ con $N = |V|$ nodos y una distribución de grado $P(k)$ (probabilidad de que un nodo elegido al azar tenga $k$ enlaces). Bajo la teoría de campo medio heterogéneo por grado (Pastor-Satorras & Vespignani, 2001; Newman, 2002), se discretizan las variables según la clase de conectividad $k$:

$$\frac{dI_k(t)}{dt} = \beta k \left(1 - I_k(t)\right) \Theta(t) - \gamma I_k(t) \quad \text{[Ecuación 7]}$$
donde $\Theta(t)$ es la probabilidad de que un enlace arbitrario que parte de un nodo conduzca a un nodo infectado:
$$\Theta(t) = \frac{\sum_k k P(k) I_k(t)}{\sum_k k P(k)} = \frac{1}{\langle k \rangle} \sum_k k P(k) I_k(t) \quad \text{[Ecuación 8]}$$

El momento de primer orden es el grado medio $\langle k \rangle = \sum_k k P(k)$, y el momento de segundo orden es $\langle k^2 \rangle = \sum_k k^2 P(k)$.

Linealizando la [Ecuación 7] en torno al equilibrio libre de infección ($I_k \approx 0$), la matriz de Jacobi asociada tiene un autovalor dominante que cruza cero en el umbral crítico de transmisibilidad $T_c$. Para el modelo SIR con transmisibilidad $T = \frac{\beta}{\beta + \gamma}$:

$$T_c = \frac{\langle k \rangle}{\langle k^2 \rangle - \langle k \rangle} \quad \text{[Ecuación 9]}$$

A partir de la [Ecuación 9], el número reproductivo efectivo en red se aproxima mediante:
$$R_{0,\text{red}} \approx T \frac{\langle k^2 \rangle - \langle k \rangle}{\langle k \rangle} \quad \text{[Ecuación 10]}$$

#### Implicación en Redes Libres de Escala (Scale-Free Barabási–Albert):
En una red Barabási–Albert, la distribución de grados sigue una ley de potencia $P(k) \sim k^{-\gamma_{\text{pl}}}$ con exponente $\gamma_{\text{pl}} \in (2, 3]$. En el límite termodinámico $N \to \infty$, el momento de segundo orden diverge ($\langle k^2 \rangle \to \infty$). En consecuencia:
$$T_c = \lim_{\langle k^2 \rangle \to \infty} \frac{\langle k \rangle}{\langle k^2 \rangle - \langle k \rangle} = 0 \quad \text{[Ecuación 11]}$$

**Teorema de Pastor-Satorras & Vespignani (2001):** En redes con topología libre de escala infinita, el umbral epidémico desaparece ($T_c = 0$). Cualquier virus o malware con transmisibilidad estrictamente positiva ($\beta > 0$), por baja que sea, se propagará y causará una epidemia global a través de los *hubs*.

---

## 3. Solución Analítica y Métodos Numéricos

### 3.1 Puntos de equilibrio y estabilidad local (Análisis del Jacobiano)
El sistema SIR autónomo ([Ecuación 1]) posee un continuo de puntos de equilibrio $(\bar{S}, \bar{I}, \bar{R}) = (S^*, 0, N - S^*)$ para cualquier $S^* \in [0, N]$, que representan los estados libres de infección activa.

Considerando las dos primeras variables independientes $(S, I)$, la matriz Jacobiana $J(S, I)$ es:
$$J(S, I) = \begin{pmatrix} -\frac{\beta I}{N} & -\frac{\beta S}{N} \\ \frac{\beta I}{N} & \frac{\beta S}{N} - \gamma \end{pmatrix} \quad \text{[Ecuación 12]}$$

Evaluando en el equilibrio libre de infección $I = 0$ con $S = S^*$:
$$J(S^*, 0) = \begin{pmatrix} 0 & -\frac{\beta S^*}{N} \\ 0 & \frac{\beta S^*}{N} - \gamma \end{pmatrix}$$

Los autovalores $\lambda$ son las raíces del polinomio característico:
$$\det(J(S^*, 0) - \lambda I) = \det \begin{pmatrix} -\lambda & -\frac{\beta S^*}{N} \\ 0 & \left(\frac{\beta S^*}{N} - \gamma\right) - \lambda \end{pmatrix} = -\lambda \left[ \left(\frac{\beta S^*}{N} - \gamma\right) - \lambda \right] = 0$$

Por tanto:
$$\lambda_1 = 0, \quad \lambda_2 = \frac{\beta S^*}{N} - \gamma = \gamma \left( R_0 \frac{S^*}{N} - 1 \right) \quad \text{[Ecuación 13]}$$

- El autovalor nulo $\lambda_1 = 0$ refleja la no aislamiento de los puntos de equilibrio (el continuo de equilibrios libres de infección sobre el eje $S$).
- La estabilidad transversal depende del signo de $\lambda_2$:
  - Si $R_0 \frac{S^*}{N} < 1 \implies \lambda_2 < 0$: El equilibrio es **localmente asintóticamente estable** en la dirección de $I$. Cualquier perturbación infinitesimal de hosts infectados se extingue exponencialmente.
  - Si $R_0 \frac{S^*}{N} > 1 \implies \lambda_2 > 0$: El equilibrio es **inestable**. Una introducción infinitesimal de infectados produce un crecimiento exponencial inicial.
  - El punto $R_0 = 1$ representa una **bifurcación transcrítica** donde se intercambia la estabilidad entre los equilibrios libres de infección.

### 3.2 Deducción del pico epidémico analítico $I_{\max}$
El pico máximo de nodos infectados ocurre cuando la tasa nula de crecimiento de $I$ se anula:
$$\frac{dI}{dt} = 0 \iff \left(\frac{\beta S}{N} - \gamma\right) I = 0 \implies S_{\text{pico}} = \frac{N}{R_0} = \frac{\gamma N}{\beta} \quad \text{[Ecuación 14]}$$

Sustituyendo $S = S_{\text{pico}} = \frac{N}{R_0}$ en la integral primera ([Ecuación 6]):
$$I_{\max} + \frac{N}{R_0} - \frac{N}{R_0} \ln\left(\frac{N}{R_0}\right) = I_0 + S_0 - \frac{N}{R_0} \ln S_0$$

Despejando $I_{\max}$:
$$I_{\max} = I_0 + S_0 - \frac{N}{R_0} \left[ 1 + \ln\left( \frac{R_0 S_0}{N} \right) \right] \quad \text{[Ecuación 15]}$$

Esta expresión permite a los analistas de ciberseguridad calcular de manera instantánea y exacta la carga máxima concurrente de equipos infectados que experimentará la red sin necesidad de integrar numéricamente todo el horizonte temporal.

### 3.3 Ecuación trascendente del tamaño final de infección $S_\infty$
Cuando $t \to \infty$, el brote se extingue y no quedan nodos infecciosos activos ($I(\infty) = 0$). Sea $S_\infty = \lim_{t\to\infty} S(t)$ el número de computadores que logran evitar el malware durante toda la vida del ataque.

Integrando la [Ecuación 1a]:
$$\frac{1}{S} \frac{dS}{dt} = -\frac{\beta}{N} I(t) \implies \int_0^\infty \frac{d}{dt}(\ln S) dt = -\frac{\beta}{N} \int_0^\infty I(t) dt$$
$$\ln\left(\frac{S_\infty}{S_0}\right) = -\frac{\beta}{N} \int_0^\infty I(t) dt \quad \text{[Ecuación 16]}$$

Por otra parte, integrando la [Ecuación 1c]:
$$\int_0^\infty \frac{dR}{dt} dt = \gamma \int_0^\infty I(t) dt \implies R_\infty - R_0 = \gamma \int_0^\infty I(t) dt$$

Asumiendo que inicialmente no hay nodos removidos ($R_0 = 0$) y que $I_\infty = 0$, se cumple que $R_\infty = N - S_\infty$. Sustituyendo en la integral:
$$\int_0^\infty I(t) dt = \frac{N - S_\infty}{\gamma}$$

Reemplazando este resultado en la [Ecuación 16]:
$$\ln\left(\frac{S_\infty}{S_0}\right) = -\frac{\beta}{\gamma N} (N - S_\infty) = -\frac{R_0}{N} (N - S_\infty) \quad \text{[Ecuación 17]}$$

Definiendo la fracción de susceptibles $s_\infty = S_\infty / N$ y $s_0 = S_0 / N \approx 1$:
$$s_\infty = \exp(-R_0 (1 - s_\infty)) \iff 1 - s_\infty = 1 - e^{-R_0 (1 - s_\infty)} \quad \text{[Ecuación 18]}$$

Esta es una **ecuación no lineal trascendente**. En **SIR-Net Lab**, se resuelve numéricamente mediante el método de bisección híbrido con Newton–Raphson, garantizando convergencia a máquina ($\text{tolerancia} < 10^{-12}$). A partir de ello, se calcula la **tasa final de ataque** $AR = 1 - S_\infty / N$.

### 3.4 Caso límite analítico: Solución logística de Verhulst ($\gamma = 0$)
Si el malware es de tipo gusano agresivo y no existe ningún mecanismo de detección ni remediación ($\gamma = 0$), ningún host pasa al compartimento $R$, de modo que $S(t) + I(t) \equiv N$. En tal caso, la [Ecuación 1b] deviene en:
$$\frac{dI}{dt} = \frac{\beta (N - I) I}{N} = \beta I \left(1 - \frac{I}{N}\right) \quad \text{[Ecuación 19]}$$

La [Ecuación 19] es la **ecuación diferencial logística de Verhulst** con capacidad de carga $N$ y tasa intrínseca de crecimiento $\beta$. Separando variables e integrando por fracciones simples con condición inicial $I(0) = I_0$:

$$I(t) = \frac{N}{1 + \left(\frac{N - I_0}{I_0}\right) e^{-\beta t}} \quad \text{[Ecuación 20]}$$

Esta solución cerrada sirve como *benchmark* analítico riguroso para auditar la precisión de los integradores numéricos en el núcleo matemático de la aplicación.

### 3.5 Algoritmos numéricos implementados
Para la integración temporal de los sistemas rígidos y no lineales de EDOs, se codificaron tres familias de solucionadores en TypeScript estricto sobre `Float64Array`:

1. **Método de Euler Explícito (Orden 1):**
   $$\mathbf{y}_{n+1} = \mathbf{y}_n + h \cdot \mathbf{f}(t_n, \mathbf{y}_n)$$
2. **Método Clásico de Runge–Kutta de 4.º Orden (RK4, Orden 4):**
   $$\begin{aligned}
   \mathbf{k}_1 &= \mathbf{f}(t_n, \mathbf{y}_n) \\
   \mathbf{k}_2 &= \mathbf{f}\left(t_n + \frac{h}{2}, \mathbf{y}_n + \frac{h}{2}\mathbf{k}_1\right) \\
   \mathbf{k}_3 &= \mathbf{f}\left(t_n + \frac{h}{2}, \mathbf{y}_n + \frac{h}{2}\mathbf{k}_2\right) \\
   \mathbf{k}_4 &= \mathbf{f}(t_n + h, \mathbf{y}_n + h\mathbf{k}_3) \\
   \mathbf{y}_{n+1} &= \mathbf{y}_n + \frac{h}{6} (\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)
   \end{aligned}$$
3. **Método Embebido de Dormand–Prince (RK45 / dopri5, Orden 5 con control de error adaptativo):**
   Utiliza un tableau de Butcher de 7 etapas ($c_i, a_{ij}, b_i, \hat{b}_i$) que computa una solución de orden 5 ($\mathbf{y}_{n+1}$) y una estimación de orden 4 ($\hat{\mathbf{y}}_{n+1}$). El vector de error local truncado es:
   $$\mathbf{e}_{n+1} = \mathbf{y}_{n+1} - \hat{\mathbf{y}}_{n+1} = h \sum_{i=1}^7 (b_i - \hat{b}_i) \mathbf{k}_i$$
   La tolerancia local se calcula componente a componente mediante $\text{sc}_i = \text{atol} + \text{rtol} \cdot \max(|y_{n,i}|, |y_{n+1,i}|)$, y la norma de error ponderada es:
   $$\text{err} = \sqrt{\frac{1}{d} \sum_{i=1}^d \left(\frac{e_{n+1,i}}{\text{sc}_i}\right)^2}$$
   El paso de tiempo se adapta automáticamente según:
   $$h_{\text{nuevo}} = h \cdot \min\left(5.0, \max\left(0.2, 0.9 \cdot \left(\frac{1}{\text{err}}\right)^{1/5}\right)\right)$$
   Si $\text{err} \le 1.0$, el paso se acepta; de lo contrario, se rechaza y se recalcula con $h_{\text{nuevo}}$.

### 3.6 Medición empírica del orden de convergencia numérico
Para verificar formalmente la corrección de los solucionadores, se comparó su solución contra el caso límite logístico analítico ([Ecuación 20]) con $N = 1000, \beta = 0.5, I_0 = 1$ en el intervalo $t \in [0, 20]$. Se computó el error absoluto global $E(h) = \max_n |I_n - I_{\text{analítico}}(t_n)|$ para pasos $h \in \{0.8, 0.4, 0.2, 0.1, 0.05, 0.025\}$.

La pendiente de la recta de regresión $\ln(E) = p \ln(h) + \ln(C)$ arroja el orden experimental de convergencia $p$:

#### Tabla 2. Resultados empíricos de convergencia numérica
| Solucionador | Pendiente Log-Log Medida ($p$) | Orden Teórico Esperado | Error a $h = 0.025$ |
|---|---|---|---|
| **Euler Explícito** | **$0.992 \approx 1$** | $O(h^1)$ | $1.42 \times 10^{-1}$ |
| **Runge–Kutta Clásico (RK4)** | **$3.998 \approx 4$** | $O(h^4)$ | $3.15 \times 10^{-7}$ |
| **Dormand–Prince (dopri5)** | **Adaptativo ($< 10^{-8}$)** | $O(h^5)$ | $1.84 \times 10^{-10}$ |

Los resultados corroboran de manera concluyente que RK4 y dopri5 cumplen con el rigor de convergencia exigido para simulación científica de alta precisión.

### 3.7 Simulación estocástica exacta: Algoritmo de Gillespie en grafos
Para modelar redes finitas donde los saltos discretos y las fluctuaciones estocásticas son determinantes, se implementó el método directo de Gillespie (1977).

Sea un grafo $G = (V, E)$ donde cada nodo $v \in V$ tiene un estado $X_v(t) \in \{S, E, I, R\}$.
Las propensiones o tasas de transición del sistema son:
1. **Infección de un nodo $u \in S$ adyacente a nodos infectados:**
   $$a_{\text{inf}}(u) = \beta_e \cdot k_{u, I} \quad \text{donde } k_{u, I} = |\{v \in \mathcal{N}(u) \mid X_v = I\}|$$
2. **Latencia a infeccioso ($E \to I$):** $a_{\text{lat}}(v) = \sigma$ para cada $v \in E$.
3. **Recuperación/Remediación ($I \to R$):** $a_{\text{rec}}(v) = \gamma$ para cada $v \in I$.

La propensión global acumulada es:
$$a_0 = \sum_{u \in S} a_{\text{inf}}(u) + \sum_{v \in E} a_{\text{lat}}(v) + \sum_{w \in I} a_{\text{rec}}(w)$$

El algoritmo procede según:
1. Generar dos números aleatorios uniformes $r_1, r_2 \sim \mathcal{U}(0, 1)$ mediante el generador PRNG determinista con semilla `sfc32`.
2. El tiempo hasta el próximo evento sigue una distribución exponencial:
   $$\tau = \frac{1}{a_0} \ln\left(\frac{1}{r_1}\right)$$
3. Se selecciona el evento $j$ que satisface la condición acumulativa de partición:
   $$\sum_{i=1}^{j-1} a_i < r_2 a_0 \le \sum_{i=1}^j a_i$$
4. Se ejecuta el cambio de estado discreto en el nodo seleccionado y se avanza el reloj de la simulación $t \leftarrow t + \tau$.
5. Se actualizan las propensiones locales de los vecinos del nodo modificado en tiempo $O(\deg(v))$ mediante arreglos indexados.

---

## 4. Validación Experimental, Calibración y Análisis de Sensibilidad

### 4.1 Batería de validación formal y conservación de masa
Se sometieron los modelos a una suite exhaustiva de 103 pruebas unitarias y 34 pruebas E2E automatizadas, validando los criterios clave resumidos en la **Tabla 3**:

#### Tabla 3. Métricas de validación formal y comparación analítico-numérica
| Prueba / Invariante | Valor Teórico / Esperado | Medición Numérica en Simulador | Discrepancia / Error Relativo |
|---|---|---|---|
| Conservación de Población $\sum X_i$ | $N = 1000$ | $1000.000000000$ | $< 1.0 \times 10^{-12}$ |
| $R_0$ en Escenario Gusano Local | $0.6 / 0.2 = 3.00$ | $3.0000$ | $0.00\%$ |
| Pico Máximo Analítico $I_{\max}$ | $300.41$ nodos | $300.38$ nodos | $0.01\%$ |
| Tiempo de Pico $S(t_{\text{pico}}) = N/R_0$ | $S = 333.33$ | $S = 333.32$ | $0.003\%$ |
| Tamaño Final $S_\infty$ ($R_0 = 3$) | $59.52$ nodos ($AR = 94.05\%$) | $59.49$ nodos ($AR = 94.05\%$) | $0.05\%$ |
| Gillespie en Grafo Completo $K_{500}$ vs EDO | Curva continua determinista | 10 réplicas promediadas | $\text{RMSE}_{\text{norm}} = 1.84\% < 3.0\%$ |

### 4.2 Calibración no lineal inversa: Algoritmo simplex Nelder–Mead
Cuando se dispone de una serie temporal de incidentes observados $\{(t_i, y_i)\}_{i=1}^M$ provenientes de registros de telemetría SIEM/EDR, se requiere estimar el vector de parámetros $\boldsymbol{\theta} = (\beta, \gamma)$.
Se formula el problema de optimización no lineal por mínimos cuadrados:

$$\min_{\boldsymbol{\theta} \in \Omega} J(\boldsymbol{\theta}) = \sum_{i=1}^M \left[ I_{\text{modelo}}(t_i; \boldsymbol{\theta}) - y_i \right]^2 \quad \text{sujeto a } \beta > 0, \gamma > 0 \quad \text{[Ecuación 21]}$$

Para optimizar $J(\boldsymbol{\theta})$ sin requerir derivadas analíticas complejas de la salida del integrador, se adaptó el algoritmo Nelder–Mead (1965) mediante transformaciones de barrera para garantizar la positividad estricta de las tasas. El método opera manteniendo un simplex de 3 vértices en $\mathbb{R}^2$ sometido a operaciones de reflexión, expansión, contracción y reducción.

Evaluado sobre un conjunto de datos sintéticos con parámetros nominales $\beta^* = 0.60, \gamma^* = 0.20$ contaminado con ruido gaussiano del 5%, el optimizador recuperó:
$$\hat{\beta} = 0.591, \quad \hat{\gamma} = 0.198 \implies \text{Error} < 1.5\%$$
alcanzando un coeficiente de determinación $R^2 = 0.994$ y un $\text{RMSE} = 4.12$ nodos.

### 4.3 Cuantificación de incertidumbre e identificabilidad mediante Bootstrap residual
Para cuantificar la variabilidad muestral sin recurrir a supuestos de normalidad asintótica, se implementó el **bootstrap residual no paramétrico** ($B = 200$ réplicas):

1. A partir del ajuste óptimo $\hat{\boldsymbol{\theta}}$, se obtienen los residuos:
   $$e_i = y_i - I_{\text{modelo}}(t_i; \hat{\boldsymbol{\theta}}), \quad i = 1, \dots, M$$
2. Se centran los residuos: $\tilde{e}_i = e_i - \bar{e}$.
3. Para cada iteración $b = 1, \dots, B$, se generan datos sintéticos pseudo-observados remuestreando con reemplazo:
   $$y_i^{(b)} = I_{\text{modelo}}(t_i; \hat{\boldsymbol{\theta}}) + \tilde{e}_{\pi(i)}^{(b)}$$
4. Se re-optimiza el sistema para obtener $\hat{\boldsymbol{\theta}}^{(b)} = (\hat{\beta}^{(b)}, \hat{\gamma}^{(b)})$.

#### Análisis de Identificabilidad Estructural y Práctica:
La superficie de costo $J(\beta, \gamma)$ exhibe un valle estrecho alargado a lo largo de la dirección $\beta / \gamma \approx \text{constante}$. Esto refleja una correlación positiva fuerte ($\rho > 0.85$) entre ambos parámetros: un incremento en la tasa de contagio $\beta$ puede ser parcialmente compensado por un incremento en la velocidad de remediación $\gamma$ para reproducir la misma curva de infectados activos. Los intervalos de confianza al 95% obtenidos por el percentil bootstrap son:
- $\beta \in [0.542, 0.648]$
- $\gamma \in [0.179, 0.224]$
- $R_0 \in [2.85, 3.12]$

### 4.4 Análisis de sensibilidad local normalizada (Diagrama de tornado)
El índice de sensibilidad local normalizado (elasticidad) de una métrica de salida $Y \in \{R_0, I_{\max}, t_{\text{pico}}, S_\infty\}$ respecto a un parámetro $p \in \{\beta, \gamma, \sigma, I_0\}$ se define como:

$$\Upsilon_p^Y = \frac{\partial Y}{\partial p} \frac{p}{Y} \approx \frac{Y(p + \Delta p) - Y(p - \Delta p)}{2 \Delta p} \frac{p}{Y} \quad \text{[Ecuación 22]}$$

Un valor de $\Upsilon_p^Y = 1.0$ indica que un incremento del 1% en el parámetro $p$ genera un incremento del 1% en la respuesta $Y$.

#### Tabla 4. Coeficientes de sensibilidad local normalizada $\Upsilon_p^Y$
| Parámetro ($p$) | Sensibilidad en $R_0$ | Sensibilidad en $I_{\max}$ | Sensibilidad en $t_{\text{pico}}$ | Sensibilidad en $S_\infty$ |
|---|---|---|---|---|
| **$\beta$ (Contagio)** | **$+1.000$** | **$+1.482$** | **$-0.912$** | **$-2.845$** |
| **$\gamma$ (Remediación)** | **$-1.000$** | **$-1.215$** | **$+0.784$** | **$+2.710$** |
| **$\sigma$ (Latencia)** | $0.000$ | $-0.085$ | $-0.412$ | $0.000$ |
| **$I_0$ (Inóculo Inicial)** | $0.000$ | $+0.041$ | $-0.156$ | $-0.012$ |

**Interpretación del Diagrama de Tornado:**
La tasa de contagio $\beta$ y la tasa de remediación $\gamma$ dominan ampliamente la dinámica del sistema. En particular, el tamaño final de sobrevivientes $S_\infty$ es extremadamente sensible a pequeñas variaciones en $\beta$ ($\Upsilon_\beta^{S_\infty} = -2.845$), lo que demuestra que reducir $\beta$ mediante segmentación preventiva tiene un efecto multiplicador de casi 3 a 1 sobre la cantidad final de máquinas preservadas.

### 4.5 Análisis de sensibilidad global por Hipercubo Latino (LHS) y Monte Carlo
A diferencia del análisis local (que evalúa derivadas parciales en un punto fijo del espacio de parámetros), el análisis global explora la propagación de incertidumbre sobre todo el hipervolumen paramétrico.

Se implementó el muestreo estratificado por **Hipercubo Latino (LHS)** con $M = 1000$ realizaciones distribuidas en un Web Worker dedicado (`sensitivity.worker.ts`). Se definieron intervalos uniformes con variación de $\pm 30\%$ respecto a los valores base:
- $\beta \sim \mathcal{U}(0.42, 0.78)$
- $\gamma \sim \mathcal{U}(0.14, 0.26)$
- $\sigma \sim \mathcal{U}(0.70, 1.30)$

El hiperespacio $3$-dimensional se particionó en $M = 1000$ estratos equiprobables por dimensión, garantizando cobertura uniforme sin agrupamientos (*clustering*). Los resultados globales revelan:
- **Media del pico de infectados:** $\bar{I}_{\max} = 298.2 \pm 48.7$ nodos.
- **Probabilidad de brote mayor ($I_{\max} > 100$ nodos):** $99.8\%$ (debido a que $R_0 > 1.6$ en todo el soporte muestral).
- **Correlación de Spearman:** Entre $R_0$ e $I_{\max}$ es de $r_s = 0.982$, confirmando que $R_0$ constituye un descriptor predictivo casi perfecto de la magnitud del desastre cibernético.

### 4.6 Barrido bidimensional y transición de fase transcrítica en $R_0 = 1$
Se computó un mapa de calor bidimensional de $I_{\max}(\beta, \gamma)$ sobre una rejilla regular de $30 \times 30$ celdas para $\beta \in [0.1, 1.2]$ y $\gamma \in [0.05, 0.50]$.
Al superponer la hipérbola teórica:
$$R_0 = \frac{\beta}{\gamma} = 1 \iff \beta = \gamma$$
se observa una correspondencia visual y numérica exacta: en toda la región $\beta < \gamma$ el pico de infectados es exactamente igual al inóculo inicial $I(0) = 1$ (ausencia de epidemia), mientras que al cruzar la línea $\beta = \gamma$ el sistema experimenta una transición de fase continua donde $I_{\max}$ crece de forma abrupta hacia valores superiores al 50% de la población de la red.

---

## 5. Interpretación Práctica, Estrategias de Contención y Recomendaciones

### 5.1 Umbral y cobertura crítica de vacunación/parcheo ($p_c$)
Supongamos que los administradores de red aplican una campaña de actualización de parches antes del inicio del brote, logrando vacunar a una fracción $p$ de los equipos susceptibles con una eficacia de protección $e \in [0, 1]$.
La fracción efectiva de equipos que permanecen susceptibles tras la campaña es $S_0 / N = 1 - e \cdot p$. Para impedir que la infección se propague, el número reproductivo efectivo inicial debe ser menor o igual a la unidad:

$$R_{\text{ef}}(0) = R_0 \frac{S_0}{N} = R_0 (1 - e \cdot p) \le 1$$

$$1 - e \cdot p \le \frac{1}{R_0} \implies e \cdot p \ge 1 - \frac{1}{R_0}$$

Despejando la **cobertura crítica de parcheo** $p_c$:
$$p_c = \frac{1 - \frac{1}{R_0}}{e} \quad \text{[Ecuación 23]}$$

#### Ejemplo práctico en ciberseguridad:
Para el escenario de gusano de red local donde $R_0 = 3.0$ con un parche totalmente efectivo ($e = 1.0$):
$$p_c = 1 - \frac{1}{3} = \frac{2}{3} \approx 66.7\%$$
Si se actualiza al menos el $66.7\%$ de las máquinas antes de la intrusión, se alcanza la **inmunidad colectiva de red** (*herd immunity*): la propagación del malware se extingue espontáneamente porque cada host infectado no logra encontrar suficientes nodos vulnerables para sustituirse a sí mismo ($R_{\text{ef}} < 1$).

### 5.2 Control por campañas de impulsos discretos
En situaciones reales, los parches masivos no se aplican de forma continua sino en instantes discretos de tiempo $t_k$ mediante políticas de grupo (GPO / Ansible).
Matemáticamente, esto se modela como un sistema diferencial con impulsos:
$$\begin{aligned}
S(t_k^+) &= S(t_k^-) \cdot (1 - p_k) \\
R(t_k^+) &= R(t_k^-) + S(t_k^-) \cdot p_k
\end{aligned} \quad \text{[Ecuación 24]}$$

Las simulaciones numéricas en **SIR-Net Lab** demuestran que:
1. Si un impulso con cobertura $p_k \ge p_c$ se despliega antes de que la epidemia alcance el pico ($t_k < t_{\text{pico}}$), el brote se corta de inmediato y el número de infecciones se desploma exponencialmente.
2. Si el impulso se ejecuta con retraso ($t_k > t_{\text{pico}}$), su utilidad marginal es prácticamente nula, puesto que la gran mayoría de nodos susceptibles ya han sido infectados y transitan hacia el estado removido de forma natural.

### 5.3 Efectividad comparativa de estrategias en red: Aleatoria vs. Hubs vs. Vecinos
Para evaluar la dispersión en arquitecturas no homogéneas, se sometieron topologías de Barabási–Albert ($N = 1000, m = 2, \langle k \rangle \approx 4, \langle k^2 \rangle \approx 42$) a tres estrategias de intervención bajo un **presupuesto cerrado idéntico** ($B = 100$ parches, equivalentes al $10\%$ de la red):

1. **Estrategia Aleatoria (*Random Patching*):** Se seleccionan $B$ nodos uniformemente al azar.
2. **Estrategia Dirigida a Hubs (*Targeted Degree Patching*):** Se seleccionan los $B$ nodos con mayor grado topológico $\deg(v)$.
3. **Estrategia por Inmunización de Vecinos (*Acquaintance Patching*):** Se eligen $B$ nodos al azar y se inmuniza a uno de sus vecinos inmediatos seleccionado aleatoriamente (aprovecha la paradoja de la amistad: los vecinos tienen en promedio un grado superior a la media de la red).

#### Tabla 5. Comparación de estrategias en red Barabási–Albert ($N = 1000$, Semillas pareadas)
| Estrategia de Control ($10\%$ presupuesto) | Nodos Infectados Finales ($AR$) | Reducción del Brote | Tiempo de Extinción ($t_{\text{ext}}$) |
|---|---|---|---|
| **Línea Base (Sin Control)** | $894$ nodos ($89.4\%$) | $0.0\%$ | $18.4$ días |
| **Parcheo Aleatorio** | $812$ nodos ($81.2\%$) | $9.2\%$ | $17.1$ días |
| **Inmunización de Vecinos** | $458$ nodos ($45.8\%$) | $48.8\%$ | $11.6$ días |
| **Parcheo Dirigido a Hubs** | **$124$ nodos ($12.4\%$)** | **$86.1\%$** | **$4.2$ días** |

**Hallazgo Crítico:**
En redes con distribución de conectividad libre de escala, vacunar aleatoriamente al $10\%$ de los nodos produce una mejora marginal ($< 10\%$). En agudo contraste, dirigir ese mismo $10\%$ de esfuerzo hacia los *hubs* (servidores de autenticación, cortafuegos centrales y repositorios clave) **destruye la percolación de la red y reduce el tamaño final de ataque en más de un $86\%$**.

### 5.4 Limitaciones del modelo y trabajo futuro
- **Parámetros Temporales Invariantes:** En la práctica, las tasas $\beta$ y $\gamma$ pueden variar con el tiempo debido a fatiga de los operadores humanos o escalamiento de contramedidas.
- **Topologías Estáticas:** La red física se asumió fija durante la epidemia. En escenarios corporativos, el aislamiento de hosts altera dinámicamente la matriz de adyacencia $A_{ij}(t)$.
- **Trabajo Futuro:** Se proyecta extender el simulador hacia modelos de juegos diferenciales no cooperativos entre atacantes y defensores, así como formular el problema de control óptimo continuo mediante el principio del máximo de Pontryagin para calcular la trayectoria óptima de inversión presupuestaria $u^*(t)$.

---

## 6. Conclusiones

1. **Rigor Matemático y Validación Numérica:** Se completó la derivación analítica de los modelos SIR y SEIR, logrando verificar de manera empírica que los integradores numéricos satisfacen los órdenes de convergencia formal ($O(h^1)$ para Euler, $O(h^4)$ para RK4 y error local acotado por $10^{-8}$ para dopri5) con conservación de masa con precisión de máquina ($< 10^{-12}$).
2. **Confirmación del Teorema de Umbral:** La condición $R_0 = \beta / \gamma > 1$ gobierna de forma exacta la bifurcación transcrítica del sistema. La ecuación analítica del pico $I_{\max}$ y la fórmula trascendente de tamaño final $S_\infty$ fueron convalidadas frente a soluciones numéricas con discrepancias relativas inferiores al $0.05\%$.
3. **El Rol Determinante de la Topología de Red:** La simulación estocástica de Gillespie demostró que en redes con alta heterogeneidad de grado (Barabási–Albert), el umbral epidémico $T_c$ colapsa drásticamente según $T_c = \langle k \rangle / (\langle k^2 \rangle - \langle k \rangle)$, acelerando la velocidad de penetración del malware respecto a lo predicho por las EDOs homogéneas.
4. **Optimización de Políticas de Ciberseguridad:** Los experimentos cuantitativos confirman que el principio de inmunización dirigida a *hubs* es entre 8 y 9 veces más eficiente que el parcheo aleatorio bajo restricciones severas de presupuesto, ofreciendo una guía prescriptiva de alto valor para equipos de seguridad informática.
5. **Calibración e Inferencia Estadística:** Se estructuró un marco de calibración inversa robusto basado en Nelder–Mead con bootstrap residual, permitiendo recuperar parámetros cinéticos reales a partir de incidentes históricos y mapear la correlación de identificabilidad entre la transmisibilidad y la tasa de remediación.

---

## 7. Referencias Bibliográficas

1. **Kermack, W. O., & McKendrick, A. G.** (1927). A contribution to the mathematical theory of epidemics. *Proceedings of the Royal Society of London. Series A*, 115(772), 700–721.
2. **Hethcote, H. W.** (2000). The mathematics of infectious diseases. *SIAM Review*, 42(4), 599–653.
3. **Kephart, J. O., & White, S. R.** (1991). Directed-graph epidemiological models of computer viruses. *Proceedings of the 1991 IEEE Computer Society Symposium on Research in Security and Privacy*, 343–359.
4. **Pastor-Satorras, R., & Vespignani, A.** (2001). Epidemic spreading in scale-free networks. *Physical Review Letters*, 86(14), 3200–3203.
5. **Newman, M. E. J.** (2002). Spread of epidemic disease on networks. *Physical Review E*, 66(1), 016128.
6. **Barabási, A.-L., & Albert, R.** (1999). Emergence of scaling in random networks. *Science*, 286(5439), 509–512.
7. **Watts, D. J., & Strogatz, S. H.** (1998). Collective dynamics of 'small-world' networks. *Nature*, 393(6684), 440–442.
8. **Erdős, P., & Rényi, A.** (1959). On random graphs I. *Publicationes Mathematicae Debrecen*, 6, 290–297.
9. **Gillespie, D. T.** (1977). Exact stochastic simulation of coupled chemical reactions. *The Journal of Physical Chemistry*, 81(25), 2340–2361.
10. **Dormand, J. R., & Prince, P. J.** (1980). A family of embedded Runge-Kutta formulae. *Journal of Computational and Applied Mathematics*, 6(1), 19–26.
11. **Zill, D. G.** (2018). *Ecuaciones diferenciales con aplicaciones de modelado* (11.ª ed.). Cengage Learning.
12. **Strogatz, S. H.** (2018). *Nonlinear Dynamics and Chaos: With Applications to Physics, Biology, Chemistry, and Engineering* (2.ª ed.). CRC Press.
13. **World Wide Web Consortium (W3C)**. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation.

---

## 8. Anexos

### Anexo A: Arquitectura de software y flujo de ejecución en Web Workers
La plataforma **SIR-Net Lab** fue desarrollada en TypeScript puro sin frameworks pesados de interfaz de usuario. Para prevenir congelamientos del hilo principal del navegador durante el cálculo de $1000$ realizaciones Monte Carlo o grafos de $2000$ nodos, se implementó una arquitectura basada en actores desacoplados:
- `ode.worker.ts`: Resuelve integraciones numéricas SIR/SEIR/SEIS y detección de eventos.
- `network.worker.ts`: Genera las matrices topológicas (ER, WS, BA) y computa el proceso estocástico de saltos de Gillespie.
- `sensitivity.worker.ts`: Ejecuta el muestreo por Hipercubo Latino (LHS) y cálculos de sensibilidad global.

### Anexo B: Guía de uso y reproducibilidad del demostrador web
1. **Acceso:** Ingrese a [https://sebasr0311.github.io/SIR-Net-Lab/](https://sebasr0311.github.io/SIR-Net-Lab/).
2. **Navegación:** Utilice la barra superior para alternar entre el Simulador EDO, Simulación en Red, Control, Calibración, Sensibilidad y Teoría.
3. **Modo Presentación:** Presione la tecla `F` en cualquier momento para activar la vista ampliada de alta visibilidad para proyección en clase; presione `Escape` para salir.
4. **Exportación:** Cada gráfica incluye un botón de descarga en formato PNG y exportación completa de la serie temporal a archivo CSV.

### Anexo C: Tabla comparativa de escenarios de referencia
| Parámetro | Gusano de Red Local | Ransomware con Latencia | Brote Contenido | Desinformación en Red |
|---|---|---|---|---|
| **Población $N$** | $1000$ | $5000$ | $1000$ | $10000$ |
| **Contagio $\beta$** | $0.60$ | $0.45$ | $0.15$ | $0.50$ |
| **Remediación $\gamma$** | $0.20$ | $0.15$ | $0.20$ | $0.10$ |
| **Latencia $\sigma$** | $1.00$ | $0.50$ | $1.00$ | $2.00$ |
| **Inóculo $I_0$** | $1$ | $5$ | $5$ | $10$ |
| **$R_0$ Teórico** | **$3.00$** | **$3.00$** | **$0.75$** | **$5.00$** |
| **Comportamiento** | Brote rápido agudo | Epidemia diferida | Extinción monótona | Brote explosivo masivo |
| **Cobertura Crítica $p_c$** | $66.7\%$ | $66.7\%$ | $0.0\%$ (Sin brote) | $80.0\%$ |
$$
