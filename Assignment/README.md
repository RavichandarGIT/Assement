# Apparel Ordering & Grade-Wise Ratio Manager

An interactive, responsive web application for managing apparel catalogues, shopping cart orders, sets breakdown, and Grade-wise size ratios across different catalogue attribute levels (Category, Brick, Brick + Neck, Brick + Sleeve).

---

## 1. Candidate Deliverables Summary

- **Working Application**: Built with HTML5, CSS3 (Vanilla), and JavaScript (ES6+). Includes Excel workbook import/export via SheetJS (`xlsx`).
- **Source Code**: Clean, decoupled architecture consisting of `index.html`, `styles.css`, and `app.js`.
- **Setup & Run Instructions**: Zero build configuration required. Open `index.html` in any web browser, or serve using any static HTTP server.
- **Grade-Wise Ratio Approach**: Supports attribute-level grouping (Category, Brick, Brick+Neck, Brick+Sleeve) with dynamic size detection.

---

## 2. Approach Explanation for Grade-Wise Ratio

### **Grade-Wise Ratio Concept**
Products in apparel wholesale ordering belong to quality or price tiers called **Grades** (e.g., Grade A, Grade B, Grade C). Size distribution across garments (e.g. S, M, L, XL, XXL) varies by Grade.

### **Ratio Levels & Attribute Grouping**
Ratios can be specified at multiple catalogue attribute levels:
1. **Category** (e.g., *Dresses*)
2. **Brick** (e.g., *Apparel*)
3. **Brick + Neck** (e.g., *Apparel - Round Neck*)
4. **Brick + Sleeve** (e.g., *Apparel - 3/4TH SLEEVE*)

### **Dynamic Calculation Formula**
1. **Ratio Multiplier by SETS**:
   $$\text{Size Quantity} = \text{Grade Ratio for Size} \times \text{SETS}$$
2. **Total Pieces per Item**:
   $$\text{Total Pieces} = \left( \sum \text{Size Quantities} \right) \times \text{SETS}$$

### **Dynamic Size Extraction**
Sizes are not hardcoded to S, M, L. The application automatically detects whichever sizes exist in the loaded dataset or uploaded Excel file (e.g. `XS, S, M, L, XL, XXL` or numerical sizes `28, 30, 32, 34`).

---

## 3. Setup & Run Instructions

### **Method 1: Direct File Launch**
1. Open the project directory (`e:\Assignment`).
2. Double-click [index.html](file:///e:/Assignment/index.html) to open directly in Google Chrome, Microsoft Edge, or Firefox.

### **Method 2: Static Server (e.g., Python / Node / VS Code Live Server)**
```bash
# Using Python
python -m http.server 8000

# Using Node npx
npx serve .
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 4. Key Application Features & Usage Flow

1. **Catalogue View & Excel Upload**:
   - Click **Upload Excel (.xlsx)** to upload custom catalogue workbooks.
   - Or click **Load Sample Catalogue** / **Download Sample Excel**.
2. **Cart & Item Cards**:
   - Product cards display dark navy header bars with title, MRP, and Cost.
   - Card body displays thumbnail image, code badge, Grade select dropdown, dynamic size input fields, SETS input, and dynamic total calculation (`= sum * sets`).
3. **Input Ratio Modal**:
   - Click **Input Ratio** at the top right to open the floating drawer.
   - Select the **Ratio Level** dropdown to group by *Category*, *Brick*, *Brick + Neck*, or *Brick + Sleeve*.
   - Edit ratios separately for Grade A, B, and C under each group.
   - Click **Save / Set Ratio** to apply across all products.
