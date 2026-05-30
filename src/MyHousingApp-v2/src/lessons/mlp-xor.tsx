import type { LessonSpec } from '../types/lesson';

/**
 * Lección: Perceptrón Multicapa (MLP) para la función lógica XOR.
 *
 * Demuestra por qué el perceptrón simple FALLA con XOR (no es linealmente
 * separable) y por qué basta una capa oculta + activación no lineal para
 * resolverlo. El Playground tiene sliders interactivos para `hidden`,
 * `max_iter` y `activation` que se inyectan en el código vía placeholders
 * `{{hidden}}`, `{{max_iter}}`, `{{activation}}`.
 */
export const mlpXorLesson: LessonSpec = {
  slug: 'mlp-xor',
  title: 'Perceptrón Multicapa · XOR',
  subtitle:
    'Aprende por qué una sola neurona no puede resolver XOR — y cómo una capa oculta lo cambia todo.',
  icon: '⚡',
  accent: 'amber',
  difficulty: 'avanzado',

  dataset: {
    path: '/datasets/xor.csv',
    targetCol: 'y',
    featureCols: ['x1', 'x2'],
    targetIsCurrency: false,
  },

  concepts: [
    {
      icon: '🚫',
      title: 'XOR no es lineal',
      body: 'No existe una sola recta que separe los puntos de clase 0 de los de clase 1. Por eso el perceptrón simple (una sola neurona) no puede resolverlo, por más épocas que entrenes.',
      accent: 'coral',
    },
    {
      icon: '🧠',
      title: 'La capa oculta',
      body: 'Añadir una capa intermedia con varias neuronas + una activación no lineal le permite a la red dibujar fronteras curvas. Aquí está la magia que rompe la limitación lineal.',
      accent: 'amber',
    },
    {
      icon: '↔️',
      title: 'Forward pass',
      body: 'Para predecir, los datos viajan capa a capa: cada neurona combina sus entradas con pesos, aplica la activación y pasa el resultado a la siguiente capa hasta la salida.',
      accent: 'teal',
    },
    {
      icon: '🔄',
      title: 'Backpropagation',
      body: 'Para aprender, la red calcula cuánto se equivocó y propaga ese error hacia atrás, ajustando cada peso un poquito en la dirección que reduce el error. Lo repite miles de veces.',
      accent: 'violet',
    },
    {
      icon: '📐',
      title: 'Funciones de activación',
      body: 'sigmoid, tanh y ReLU son funciones no lineales que transforman la salida de cada neurona. Sin ellas, apilar capas sería equivalente a una sola capa lineal — y XOR seguiría sin solución.',
      accent: 'amber',
    },
    {
      icon: '⚙️',
      title: 'Hiperparámetros',
      body: 'Número de neuronas ocultas, iteraciones, tasa de aprendizaje y activación. Pequeños cambios pueden marcar la diferencia entre converger en milisegundos o fallar. Lo verás en el Playground.',
      accent: 'coral',
    },
  ],

  datasetView: {
    visibleColumns: ['x1', 'x2', 'y'],
    filters: [
      { column: 'x1', type: 'range', label: 'x1', min: -0.5, max: 1.5, step: 0.1 },
      { column: 'x2', type: 'range', label: 'x2', min: -0.5, max: 1.5, step: 0.1 },
    ],
    plots: [],
    pageSize: 10,
  },

  codeSteps: [
    {
      id: '1',
      title: 'Importar librerías',
      explanationMd:
        'Importamos `MLPClassifier` (la red neuronal) y `Perceptron` (el lineal clásico). Cargaremos el CSV con los 4 puntos puros de XOR + 100 sintéticos con ruido para que el modelo aprenda a generalizar.',
      code: `import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import Perceptron
from sklearn.metrics import accuracy_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64

print('Librerías importadas correctamente.')`,
    },

    {
      id: '2',
      title: 'Cargar el dataset XOR',
      explanationMd:
        'El CSV tiene 104 filas: los **4 puntos puros** de la tabla de verdad XOR + **100 puntos sintéticos** alrededor (25 por esquina, con ruido gaussiano). Las primeras 4 filas son los puros.',
      code: `data = pd.read_csv('/xor.csv')

X = data[['x1', 'x2']].values
y = data['y'].values

print('Dataset cargado:', data.shape)
print()
print('Tabla de verdad XOR (las 4 primeras filas son los puntos puros):')
print(data.head(4).to_string(index=False))
print()
print('Distribución de clases (0/1):')
print(data['y'].value_counts().to_string())`,
    },

    {
      id: '3',
      title: 'Visualizar: ¿son separables con una recta?',
      explanationMd:
        'Gráficamos los 104 puntos coloreados por clase. **No existe ninguna recta** que separe los 0 de los 1: están en diagonal. Esta es la razón por la que un perceptrón simple no puede resolver XOR.',
      expectsPlot: true,
      code: `fig, ax = plt.subplots(figsize=(6, 5))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')

# Clase 0 = teal, Clase 1 = amber
mask0 = y == 0
mask1 = y == 1
ax.scatter(X[mask0, 0], X[mask0, 1], c='#1DC98A', s=30, alpha=0.7,
           edgecolors='#0F6E56', linewidths=0.5, label='clase 0')
ax.scatter(X[mask1, 0], X[mask1, 1], c='#F5A623', s=30, alpha=0.7,
           edgecolors='#8a5a0e', linewidths=0.5, label='clase 1')

ax.set_xlabel('x1', color='#8b949e')
ax.set_ylabel('x2', color='#8b949e')
ax.set_title('XOR — los puntos NO son linealmente separables',
             color='#e6edf3', pad=10)
ax.tick_params(colors='#8b949e')
for spine in ax.spines.values():
    spine.set_edgecolor('#30363d')
ax.grid(True, color='#30363d', linewidth=0.4, linestyle='--')
leg = ax.legend(loc='upper right', facecolor='#161b22',
                edgecolor='#30363d', labelcolor='#e6edf3')

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=110, bbox_inches='tight',
            facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')
print('Scatter generado. Observa: no hay forma de trazar una recta única que separe los 0 de los 1.')`,
    },

    {
      id: '4',
      title: 'Intentar con un perceptrón simple (falla)',
      explanationMd:
        'Un `Perceptron` es una sola neurona lineal: solo puede dibujar **una recta** como frontera. Lo entrenamos y medimos accuracy. Resultado esperado: ~50–75%, equivalente a adivinar. Esto motiva la necesidad de la capa oculta.',
      code: `perceptron = Perceptron(max_iter=2000, tol=1e-4, random_state=42)
perceptron.fit(X, y)
pred_perc = perceptron.predict(X)
acc_perc = accuracy_score(y, pred_perc)

print(f'Accuracy del Perceptrón simple: {acc_perc * 100:.1f}%')
print()
print('Confusión: cuántas veces predijo cada clase')
print(f'  Predicho 0 (real 0): {((pred_perc == 0) & (y == 0)).sum()}')
print(f'  Predicho 0 (real 1): {((pred_perc == 0) & (y == 1)).sum()}')
print(f'  Predicho 1 (real 0): {((pred_perc == 1) & (y == 0)).sum()}')
print(f'  Predicho 1 (real 1): {((pred_perc == 1) & (y == 1)).sum()}')
print()
print('Conclusión: el perceptrón no logra separar XOR — es matemáticamente imposible con una recta.')`,
    },

    {
      id: '5',
      title: 'Resolver con MLP (capa oculta de 4 neuronas)',
      explanationMd:
        'Ahora con `MLPClassifier(hidden_layer_sizes=(4,))`: una **capa oculta de 4 neuronas** con activación `tanh`. Internamente, el solver `adam` ejecuta forward + backpropagation por miles de iteraciones, ajustando los pesos. Resultado: accuracy alta.',
      code: `mlp = MLPClassifier(
    hidden_layer_sizes=(4,),
    activation='tanh',
    solver='adam',
    max_iter=2000,
    random_state=42,
)
mlp.fit(X, y)
pred_mlp = mlp.predict(X)
acc_mlp = accuracy_score(y, pred_mlp)
loss_final = mlp.loss_
n_iter = mlp.n_iter_

print(f'Accuracy del MLP: {acc_mlp * 100:.1f}%')
print(f'Loss final: {loss_final:.4f}')
print(f'Iteraciones hasta converger: {n_iter}')
print()
print(f'Capa oculta: {mlp.hidden_layer_sizes[0]} neuronas (tanh)')
print(f'Pesos aprendidos (capa 1): {mlp.coefs_[0].shape}')
print(f'Pesos aprendidos (capa 2): {mlp.coefs_[1].shape}')
print()
print('La capa oculta + no-linealidad rompe la limitación. La red aprende a combinar regiones.')

# Publicar resultados al store global (Reporte)
import js
js.window.publishResults({
    'accuracy': float(acc_mlp),
    'loss': float(loss_final),
    'n_iter': float(n_iter),
})`,
    },

    {
      id: '6',
      title: 'Visualizar la frontera de decisión',
      explanationMd:
        'Dibujamos el plano [0,1]² coloreado según cómo clasificaría la red cada punto. Verás que la frontera **NO es una recta**: la red dobló el espacio para separar diagonales. Ahí está la potencia de la capa oculta.',
      expectsPlot: true,
      code: `# Malla densa cubriendo el plano del dataset
xx, yy = np.meshgrid(np.linspace(-0.3, 1.3, 200),
                     np.linspace(-0.3, 1.3, 200))
grid = np.c_[xx.ravel(), yy.ravel()]
Z = mlp.predict_proba(grid)[:, 1].reshape(xx.shape)

fig, ax = plt.subplots(figsize=(6, 5))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')

# Contour: tonalidades teal→amber según prob de clase 1
contour = ax.contourf(xx, yy, Z, levels=20, cmap='RdYlGn_r', alpha=0.55)
ax.contour(xx, yy, Z, levels=[0.5], colors='#e6edf3',
           linewidths=2, linestyles='--')

mask0 = y == 0
mask1 = y == 1
ax.scatter(X[mask0, 0], X[mask0, 1], c='#1DC98A', s=35, alpha=0.95,
           edgecolors='#061010', linewidths=0.8, label='clase 0')
ax.scatter(X[mask1, 0], X[mask1, 1], c='#F5A623', s=35, alpha=0.95,
           edgecolors='#3a280a', linewidths=0.8, label='clase 1')

ax.set_xlabel('x1', color='#8b949e')
ax.set_ylabel('x2', color='#8b949e')
ax.set_title('Frontera de decisión aprendida por el MLP',
             color='#e6edf3', pad=10)
ax.tick_params(colors='#8b949e')
for spine in ax.spines.values():
    spine.set_edgecolor('#30363d')
ax.legend(loc='upper right', facecolor='#161b22',
          edgecolor='#30363d', labelcolor='#e6edf3')

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=110, bbox_inches='tight',
            facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')
print('Frontera de decisión generada. La línea blanca discontinua es donde la red duda entre 0 y 1.')`,
    },
  ],

  playgroundCode: `import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64
import js

# Cargar dataset XOR (4 puros + 100 con ruido)
data = pd.read_csv('/xor.csv')
X = data[['x1', 'x2']].values
y = data['y'].values

# Hiperparámetros controlados por los sliders del panel lateral
HIDDEN     = {{hidden}}
MAX_ITER   = {{max_iter}}
ACTIVATION = {{activation}}

# Entrenar el MLP
mlp = MLPClassifier(
    hidden_layer_sizes=(HIDDEN,),
    activation=ACTIVATION,
    solver='adam',
    max_iter=MAX_ITER,
    random_state=42,
)
mlp.fit(X, y)

# Métricas
pred = mlp.predict(X)
accuracy = accuracy_score(y, pred)
loss = mlp.loss_
n_iter = mlp.n_iter_

print(f'Hiperparámetros: hidden={HIDDEN}, max_iter={MAX_ITER}, activation={ACTIVATION!r}')
print(f'Accuracy: {accuracy * 100:.1f}%')
print(f'Loss final: {loss:.4f}')
print(f'Iteraciones realizadas: {n_iter}')

# Decision boundary
xx, yy = np.meshgrid(np.linspace(-0.3, 1.3, 180),
                     np.linspace(-0.3, 1.3, 180))
grid = np.c_[xx.ravel(), yy.ravel()]
Z = mlp.predict_proba(grid)[:, 1].reshape(xx.shape)

fig, ax = plt.subplots(figsize=(5, 4.2))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')

ax.contourf(xx, yy, Z, levels=20, cmap='RdYlGn_r', alpha=0.55)
ax.contour(xx, yy, Z, levels=[0.5], colors='#e6edf3',
           linewidths=2, linestyles='--')

mask0 = y == 0
mask1 = y == 1
ax.scatter(X[mask0, 0], X[mask0, 1], c='#1DC98A', s=28, alpha=0.95,
           edgecolors='#061010', linewidths=0.6, label='clase 0')
ax.scatter(X[mask1, 0], X[mask1, 1], c='#F5A623', s=28, alpha=0.95,
           edgecolors='#3a280a', linewidths=0.6, label='clase 1')

ax.set_xlabel('x1', color='#8b949e', fontsize=9)
ax.set_ylabel('x2', color='#8b949e', fontsize=9)
ax.set_title(f'MLP · hidden={HIDDEN} · {ACTIVATION}',
             color='#e6edf3', fontsize=11, pad=8)
ax.tick_params(colors='#8b949e', labelsize=8)
for spine in ax.spines.values():
    spine.set_edgecolor('#30363d')
ax.legend(loc='upper right', facecolor='#161b22',
          edgecolor='#30363d', labelcolor='#e6edf3', fontsize=8)

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=110, bbox_inches='tight',
            facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')

# Publicar métricas
js.window.publishResults({
    'accuracy': float(accuracy),
    'loss': float(loss),
    'n_iter': float(n_iter),
})`,

  parameters: [
    {
      key: 'hidden',
      label: 'Neuronas en capa oculta',
      type: 'number',
      min: 1,
      max: 16,
      step: 1,
      default: 4,
    },
    {
      key: 'max_iter',
      label: 'Máx. iteraciones',
      type: 'number',
      min: 50,
      max: 5000,
      step: 50,
      default: 2000,
    },
    {
      key: 'activation',
      label: 'Función de activación',
      type: 'select',
      default: 'tanh',
      options: [
        { value: 'tanh', label: 'tanh' },
        { value: 'relu', label: 'relu' },
        { value: 'logistic', label: 'sigmoid' },
      ],
    },
  ],

  metrics: [
    {
      key: 'accuracy',
      label: 'Accuracy — % de aciertos',
      format: 'percent',
      decimals: 1,
      source: 'global',
      verdict: [
        { if: 'gte', value: 0.95, label: 'Excelente', tone: 'good' },
        { if: 'gte', value: 0.75, label: 'Aceptable', tone: 'medium' },
        { if: 'lte', value: 0.75, label: 'Insuficiente', tone: 'poor' },
      ],
    },
    {
      key: 'loss',
      label: 'Loss final',
      format: 'decimal',
      decimals: 4,
      source: 'global',
    },
    {
      key: 'n_iter',
      label: 'Iteraciones hasta converger',
      format: 'number',
      decimals: 0,
      source: 'global',
    },
  ],

  conclusionsMd: `### ¿Qué aprendimos?

El XOR no es linealmente separable: ninguna recta separa sus clases. El **perceptrón simple** (una sola neurona) es lineal por definición, así que **nunca** puede resolverlo — no importa cuánto lo entrenes.

La solución es añadir una **capa oculta** con varias neuronas y una **función de activación no lineal** (tanh, ReLU, sigmoid). Esa combinación deja a la red "doblar" el espacio para separar las clases con una frontera curva.

### Cómo aprende la red (forward + backprop)

1. **Forward pass**: los datos entran, cada capa los transforma con \`activation(W·x + b)\` y pasan a la siguiente capa.
2. **Cálculo del error**: se compara la predicción con la etiqueta real (loss).
3. **Backpropagation**: el error se propaga hacia atrás capa a capa usando la regla de la cadena, calculando cuánto debe cambiar cada peso.
4. **Actualización**: el optimizador (\`adam\` aquí) ajusta los pesos en pequeños pasos.
5. Repetir miles de veces hasta que la loss baje y la red generalice.

### Qué observar en el Playground

- **1 neurona**: equivalente a perceptrón. Falla en XOR.
- **2 neuronas**: el mínimo teórico para XOR. Suele funcionar.
- **4–8 neuronas**: convergencia rápida y frontera más limpia.
- **activation=ReLU** con tan pocos datos: a veces necesita más iteraciones.
- **max_iter bajo**: la red no alcanza a converger y la accuracy cae.

### El gran punto pedagógico

XOR es el ejemplo histórico que **demostró las limitaciones del perceptrón simple en 1969** (Minsky & Papert) y motivó la búsqueda de redes multicapa. Cuando se redescubrió la backpropagation en los 80, este problema fue uno de los primeros que se resolvieron — y abrió la puerta al deep learning moderno.

### Próximos pasos naturales

- **Múltiples capas ocultas**: probar \`hidden_layer_sizes=(4, 4)\` para una red más profunda.
- **Problemas más complejos**: clasificar dígitos (MNIST), imágenes (CIFAR).
- **Otras arquitecturas**: convolucionales (CNN) para imágenes, recurrentes (RNN) para secuencias.`,
};
