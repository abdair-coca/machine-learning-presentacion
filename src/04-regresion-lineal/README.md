# Modelo de Regresión Lineal

## Responsable
- Nombre del integrante

---

# Objetivo

Explicar cómo funciona un modelo de **Regresión Lineal** utilizando teoría, gráficos y código en Python.

El integrante encargado deberá:
- Explicar qué es la regresión lineal
- Mostrar cómo entrenar un modelo
- Realizar una predicción
- Graficar los resultados
- Explicar el código utilizado

---

# Conceptos que Deben Explicarse

## ¿Qué es la Regresión Lineal?

La regresión lineal es un modelo de Machine Learning utilizado para predecir valores numéricos mediante una relación lineal entre variables.

La ecuación principal es:

```text
y = mx + b
```

Donde:
- `x` → variable independiente
- `y` → valor predicho
- `m` → pendiente
- `b` → intercepto

---

# Contenido Esperado

El integrante deberá incluir:

## Explicación Teórica
- Qué es regresión lineal
- Variables independientes y dependientes
- Entrenamiento del modelo
- Predicciones

---

## Código Funcional en Python

El código debe:
- cargar datos
- entrenar un modelo
- realizar predicciones
- mostrar gráficos

---

## Gráficos

Se recomienda incluir:
- puntos del dataset
- línea de regresión
- resultados de predicción

---

# Archivos Esperados

```text
04_regresion_lineal/
│
├── README.md
├── regresion.py (ya existe)
├── graficos/
└── Housing.csv
```

---

# Configuración del Entorno de Desarrollo (obligatorio)

## 1. Crear un Entorno Virtual

Abrir la terminal en la carpeta del proyecto y ejecutar:

```bash
python -m venv venv
```

Esto creará una carpeta llamada `venv` donde se instalarán las librerías necesarias.

---

## 2. Activar el Entorno Virtual

### Windows (PowerShell)

```powershell
.\venv\Scripts\Activate
```

### Windows (CMD)

```cmd
venv\Scripts\activate
```

Si todo funciona correctamente aparecerá algo similar a:

```bash
(venv) PS C:\Proyecto>
```

---

## 3. Instalar las Librerías Necesarias

```bash
pip install pandas scikit-learn matplotlib
```

---

# ¿Para Qué Sirve Cada Librería?

| Librería | Uso |
|---|---|
| Pandas | Leer y manipular datasets |
| Scikit-learn | Crear y entrenar el modelo de regresión lineal |
| Matplotlib | Crear gráficos y visualizaciones |

---

## 4. Verificar Instalaciones

```bash
pip list
```

También se puede probar directamente en Python:

```python
import pandas
import sklearn
import matplotlib
```

Si no aparece ningún error, todo está correctamente instalado.

---

## 5. Guardar Dependencias del Proyecto

```bash
pip freeze > requirements.txt
```

Esto generará un archivo `requirements.txt` con todas las dependencias instaladas.

Para instalar las dependencias en otro equipo:

```bash
pip install -r requirements.txt
```

---

## 6. Desactivar el Entorno Virtual

```bash
deactivate
```

---

# Estructura Recomendada del Proyecto

```text
mi-proyecto-ml/
│
├── venv/
├── data/
├── notebooks/
├── src/
│   └── 04_regresion_lineal/
│       ├── regresion.py
│       ├── dataset.csv
│       ├── README.md
│       └── graficos/
│
├── requirements.txt
└── README.md
```

---

# Configuración de `.gitignore`

Crear un archivo llamado `.gitignore` y agregar:

```gitignore
venv/
__pycache__/
```

Esto evita subir archivos innecesarios al repositorio.

---

# Recomendaciones Importantes

- Mantener el código ordenado y comentado
- Explicar cada parte importante del código
- Usar nombres descriptivos
- Hacer commits claros en GitHub
- Subir gráficos e imágenes utilizados en la exposición

---

# Estado

En desarrollo.