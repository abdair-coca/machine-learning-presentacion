# Proyecto de Machine Learning

## Descripción General

Este repositorio contiene el trabajo grupal de la materia **Programación de Modelos y Simulación**.

El objetivo principal del proyecto es presentar conceptos fundamentales de **Machine Learning**, incluyendo:
- Subcampos de la Inteligencia Artificial
- Evolución histórica de la IA
- Datasets y librerías utilizadas en Machine Learning
- Implementación de un modelo de Regresión Lineal
- Reportes y conclusiones

---

# Integrantes del Equipo

| Integrante | Responsabilidad |
|---|---|
| Roberto Copa | Subcampos de IA |
| Juan Canaza & Rodrigo Oquendo | Línea de tiempo |
| Carlos Matos | Datasets y librerías |
| Moises Torrez | Regresión lineal |
| Abdair Coca | Reportes, conclusiones e integración del proyecto |

---

# Tecnologías Utilizadas

- Python
- Jupyter Notebook
- NumPy
- Pandas
- Matplotlib
- Scikit-learn
- Git & GitHub

---

# Estructura del Proyecto

```txt
machine-learning-presentation/
│
├── docs/
├── data/
├── notebooks/
├── src/
│   ├── 01_subcampos_ia/
│   ├── 02_linea_tiempo/
│   ├── 03_dataset_librerias/
│   ├── 04_regresion_lineal/
│   └── 05_reportes_conclusiones/
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

# Cómo Trabajaremos en Equipo

Este proyecto utilizará un flujo de trabajo colaborativo usando Git y GitHub.

## Reglas Importantes

### NO trabajar directamente sobre `main`

Cada integrante debe trabajar en su propia rama.

---

### NO modificar archivos de otros integrantes

Cada integrante es responsable de su propia sección.

---

### Siempre actualizar antes de comenzar a trabajar

Esto evita conflictos.

---

# Guía Paso a Paso

## 1. Clonar el Repositorio

Cada integrante debe clonar el repositorio:

```bash
git clone https://github.com/abdair-coca/machine-learning-presentacion
```

---

## 2. Entrar a la Carpeta del Proyecto

```bash
cd machine-learning-presentacion
```

---

## 3. Crear tu Rama

Cada integrante debe crear una rama para trabajar.

Ejemplos:

```bash
git checkout -b feature/subcampos-ia
```

```bash
git checkout -b feature/linea-tiempo
```

```bash
git checkout -b feature/datasets
```

```bash
git checkout -b feature/regresion-lineal
```

```bash
git checkout -b feature/reportes
```

---

## 4. Trabajar Solo en tu Carpeta

Ejemplo:

Si tu tema es Regresión Lineal:

```txt
src/04_regresion_lineal/
```

No modificar carpetas ajenas sin necesidad.

---

## 5. Guardar Cambios

Después de trabajar:

```bash
git add .
```

Luego:

```bash
git commit -m "Agrega explicación de regresión lineal"
```

---

## 6. Subir Cambios a GitHub

```bash
git push origin nombre-de-tu-rama
```

Ejemplo:

```bash
git push origin feature/regresion-lineal
```

---

# Pull Requests

Después de terminar una parte:

1. Entrar al repositorio en GitHub
2. Ir a la pestaña "Pull Requests"
3. Crear un nuevo Pull Request
4. Solicitar revisión

El líder del proyecto revisará e integrará los cambios.

---

# Recomendaciones

## Mantener código limpio

Usar nombres descriptivos:
- `regresion.py`
- `dataset_estudiantes.csv`

Evitar nombres como:
- `codigo_final2.py`
- `pruebaaaaa.py`

---

## Hacer commits claros

Mal ejemplo:

```bash
git commit -m "cosas"
```

Buen ejemplo:

```bash
git commit -m "Agrega modelo de regresión lineal con sklearn"
```

---

## No subir archivos innecesarios

NO subir:
- carpetas `venv`
- archivos temporales
- archivos pesados innecesarios

El archivo `.gitignore` ya está configurado para ayudar con esto.

---

# Librerías Principales

## NumPy
Utilizada para operaciones matemáticas y arreglos numéricos.

## Pandas
Utilizada para manipulación y análisis de datos.

## Matplotlib
Utilizada para crear gráficos y visualizaciones.

## Scikit-learn
Utilizada para construir modelos de Machine Learning.

---

# Objetivo del Proyecto

Además de realizar la exposición, este proyecto busca:
- aprender trabajo colaborativo con GitHub
- organizar código profesionalmente
- practicar Machine Learning básico
- desarrollar buenas prácticas de programación

---

# Estado del Proyecto

En desarrollo.
