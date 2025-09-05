// ===== EXPORT CONTROLLER =====
class ExportController {
    constructor(app) {
        this.app = app;
        this.modal = document.getElementById('export-modal');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Export button in navbar
        document.querySelector('.export-btn').addEventListener('click', () => this.showExportModal());
        
        // Modal close buttons
        this.modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.hideExportModal());
        });
        
        // Modal backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideExportModal();
            }
        });
        
        // Export options
        this.modal.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const exportType = e.currentTarget.dataset.type;
                this.exportLayout(exportType);
            });
        });
        
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.showExportModal();
            }
            
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hideExportModal();
            }
        });
    }
    
    showExportModal() {
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const firstOption = this.modal.querySelector('.export-option');
        if (firstOption) firstOption.focus();
    }
    
    hideExportModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    async exportLayout(type) {
        this.hideExportModal();
        
        try {
            // Show loading state
            const exportBtn = document.querySelector('.export-btn');
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Exporting...</span>';
            exportBtn.disabled = true;
            
            switch (type) {
                case 'html-css':
                    await this.exportHtmlCss();
                    break;
                case 'html':
                    await this.exportHtmlOnly();
                    break;
                case 'css':
                    await this.exportCssOnly();
                    break;
                default:
                    throw new Error('Unknown export type');
            }
            
            this.app.showToast('Export completed successfully!', 'success');
            
            // Reset button state
            setTimeout(() => {
                exportBtn.innerHTML = originalText;
                exportBtn.disabled = false;
            }, 1000);
            
        } catch (error) {
            console.error('Export error:', error);
            this.app.showToast('Export failed. Please try again.', 'error');
            
            // Reset button state
            const exportBtn = document.querySelector('.export-btn');
            exportBtn.innerHTML = '<i class="fas fa-download"></i><span>Export</span>';
            exportBtn.disabled = false;
        }
    }
    
    async exportHtmlCss() {
        const zip = new JSZip();
        
        // Generate files
        const htmlContent = this.generateCompleteHtml();
        const cssContent = this.generateCompleteCss();
        const readmeContent = this.generateReadme();
        
        // Add files to zip
        zip.file('index.html', htmlContent);
        zip.file('styles.css', cssContent);
        zip.file('README.md', readmeContent);
        
        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(content, `flexify-layout-${Date.now()}.zip`);
    }
    
    async exportHtmlOnly() {
        const zip = new JSZip();
        
        // Generate HTML with inline styles
        const htmlContent = this.generateHtmlWithInlineStyles();
        const readmeContent = this.generateReadme();
        
        // Add files to zip
        zip.file('index.html', htmlContent);
        zip.file('README.md', readmeContent);
        
        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(content, `flexify-html-${Date.now()}.zip`);
    }
    
    async exportCssOnly() {
        const zip = new JSZip();
        
        // Generate CSS files
        const cssContent = this.generateCompleteCss();
        const minifiedCss = this.minifyCss(cssContent);
        const readmeContent = this.generateReadme();
        
        // Add files to zip
        zip.file('styles.css', cssContent);
        zip.file('styles.min.css', minifiedCss);
        zip.file('README.md', readmeContent);
        
        // Generate and download zip
        const content = await zip.generateAsync({ type: 'blob' });
        this.downloadFile(content, `flexify-css-${Date.now()}.zip`);
    }
    
    generateCompleteHtml() {
        const viewport = this.app.currentViewport;
        const timestamp = new Date().toISOString();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexify Generated Layout</title>
    <meta name="description" content="CSS Grid layout generated by Flexify - Visual CSS Grid Builder">
    <meta name="generator" content="Flexify v1.0.0">
    <meta name="created" content="${timestamp}">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Generated by Flexify - Visual CSS Grid Builder -->
    <!-- https://flexify.dev -->
    
    <div class="grid-container ${viewport}">
        ${this.generateBoxesHtml()}
    </div>
    
    <!-- Optional: Add your JavaScript here -->
    <script>
        // Layout generated on ${new Date().toLocaleDateString()}
        console.log('Flexify layout loaded successfully!');
        
        // Add any custom interactions here
        document.addEventListener('DOMContentLoaded', function() {
            // Your code here
        });
    </script>
</body>
</html>`;
    }
    
    generateHtmlWithInlineStyles() {
        const viewport = this.app.currentViewport;
        const cssContent = this.generateCompleteCss();
        const timestamp = new Date().toISOString();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexify Generated Layout</title>
    <meta name="description" content="CSS Grid layout generated by Flexify - Visual CSS Grid Builder">
    <meta name="generator" content="Flexify v1.0.0">
    <meta name="created" content="${timestamp}">
    <style>
        ${cssContent}
    </style>
</head>
<body>
    <!-- Generated by Flexify - Visual CSS Grid Builder -->
    <!-- https://flexify.dev -->
    
    <div class="grid-container ${viewport}">
        ${this.generateBoxesHtml()}
    </div>
    
    <script>
        console.log('Flexify layout loaded successfully!');
    </script>
</body>
</html>`;
    }
    
    generateBoxesHtml() {
        return this.app.boxes.map((box, index) => {
            const boxNumber = index + 1;
            return `        <div class="grid-item item-${boxNumber}" data-box-id="${box.id}">
            <div class="box-content">
                <span class="box-label">Box ${boxNumber}</span>
                <!-- Add your content here -->
            </div>
        </div>`;
        }).join('\n');
    }
    
    generateCompleteCss() {
        const viewport = this.app.currentViewport;
        const timestamp = new Date().toISOString();
        
        let css = `/*
 * Flexify Generated Layout
 * Created: ${timestamp}
 * Generator: Flexify v1.0.0
 * Viewport: ${viewport}
 * Total Boxes: ${this.app.boxes.length}
 */

/* === RESET & BASE STYLES === */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8fafc;
}

/* === GRID CONTAINER === */
.grid-container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(8, minmax(80px, auto));
    gap: 16px;
    padding: 20px;
    min-height: 100vh;
    background-color: #ffffff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

/* === RESPONSIVE VIEWPORT STYLES === */
.grid-container.desktop {
    max-width: 1200px;
    margin: 0 auto;
}

.grid-container.tablet {
    max-width: 768px;
    margin: 0 auto;
}

.grid-container.mobile {
    max-width: 375px;
    margin: 0 auto;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: repeat(12, minmax(60px, auto));
}

/* === GRID ITEMS BASE === */
.grid-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
    position: relative;
}

.grid-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.box-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    position: relative;
    z-index: 1;
}

.box-label {
    font-weight: 600;
    font-size: 14px;
    opacity: 0.9;
}

/* === INDIVIDUAL BOX STYLES === */
${this.generateBoxStyles()}

/* === RESPONSIVE DESIGN === */
@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: repeat(6, 1fr);
        gap: 12px;
        padding: 16px;
    }
    
    .grid-item {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    .grid-container {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        padding: 12px;
    }
    
    .grid-item {
        font-size: 11px;
    }
    
    .box-label {
        font-size: 11px;
    }
}

/* === UTILITY CLASSES === */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }

.rounded { border-radius: 8px; }
.shadow { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }

/* === PRINT STYLES === */
@media print {
    .grid-container {
        box-shadow: none;
        background: white;
    }
    
    .grid-item {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        break-inside: avoid;
    }
}`;
        
        return css;
    }
    
    generateBoxStyles() {
        return this.app.boxes.map((box, index) => {
            const itemClass = `.item-${index + 1}`;
            const contrastColor = this.getContrastColor(box.backgroundColor);
            
            return `${itemClass} {
    grid-column: ${box.gridColumn} / span ${box.gridColumnSpan};
    grid-row: ${box.gridRow} / span ${box.gridRowSpan};
    background-color: ${box.backgroundColor};
    color: ${contrastColor};
    padding: ${box.padding.top}px ${box.padding.right}px ${box.padding.bottom}px ${box.padding.left}px;
    margin: ${box.margin.top}px ${box.margin.right}px ${box.margin.bottom}px ${box.margin.left}px;
}`;
        }).join('\n\n');
    }
    
    generateReadme() {
        const timestamp = new Date().toLocaleDateString();
        const viewport = this.app.currentViewport;
        
        return `# Flexify Generated Layout

This layout was generated using **Flexify** - Visual CSS Grid Builder.

## 📋 Layout Information

- **Generated**: ${timestamp}
- **Viewport**: ${viewport}
- **Total Boxes**: ${this.app.boxes.length}
- **Grid System**: 12 columns × 8 rows
- **Gap**: 16px

## 📁 Files Included

- \`index.html\` - Complete HTML structure
- \`styles.css\` - CSS Grid styles and responsive design
- \`README.md\` - This documentation

## 🚀 Getting Started

1. Open \`index.html\` in your web browser
2. Customize the content inside each \`.grid-item\`
3. Modify styles in \`styles.css\` as needed
4. Deploy to your preferred hosting service

## 🎨 Customization

### Adding Content
Replace the placeholder content in each \`.grid-item\`:

\`\`\`html
<div class="grid-item item-1">
    <!-- Your custom content here -->
    <h2>Your Title</h2>
    <p>Your content...</p>
</div>
\`\`\`

### Styling
Each box has its own CSS class (\`.item-1\`, \`.item-2\`, etc.) for easy customization:

\`\`\`css
.item-1 {
    /* Custom styles for box 1 */
    background: linear-gradient(45deg, #ff6b6b, #feca57);
}
\`\`\`

### Responsive Behavior
The layout includes responsive breakpoints:
- **Desktop**: 1200px max-width
- **Tablet**: 768px max-width, 6-column grid
- **Mobile**: 375px max-width, 4-column grid

## 🛠️ Browser Support

- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

## 📚 Resources

- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexify Documentation](https://flexify.dev/docs)
- [CSS Grid Browser Support](https://caniuse.com/css-grid)

## 🆘 Support

If you need help customizing your layout:
- Visit [Flexify.dev](https://flexify.dev)
- Check our [documentation](https://flexify.dev/docs)
- Join our [community](https://flexify.dev/community)

---

Generated with ❤️ by [Flexify](https://flexify.dev)
`;
    }
    
    minifyCss(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
            .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
            .replace(/\s*{\s*/g, '{') // Remove space around opening brace
            .replace(/}\s*/g, '}') // Remove space after closing brace
            .replace(/;\s*/g, ';') // Remove space after semicolon
            .replace(/,\s*/g, ',') // Remove space after comma
            .replace(/:\s*/g, ':') // Remove space after colon
            .trim();
    }
    
    getContrastColor(backgroundColor) {
        // Convert hex to RGB
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calculate luminance using WCAG formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white based on luminance
        return luminance > 0.5 ? '#1a202c' : '#ffffff';
    }
    
    downloadFile(content, filename) {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    
    // Preview functionality
    previewLayout() {
        const htmlContent = this.generateCompleteHtml();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    
    // Copy to clipboard functionality
    async copyHtmlToClipboard() {
        try {
            const htmlContent = this.generateCompleteHtml();
            await navigator.clipboard.writeText(htmlContent);
            this.app.showToast('HTML copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.app.showToast('Failed to copy to clipboard', 'error');
        }
    }
    
    async copyCssToClipboard() {
        try {
            const cssContent = this.generateCompleteCss();
            await navigator.clipboard.writeText(cssContent);
            this.app.showToast('CSS copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.app.showToast('Failed to copy to clipboard', 'error');
        }
    }
    
    // Export to different formats
    async exportToCodepen() {
        const htmlContent = this.generateBoxesHtml();
        const cssContent = this.generateCompleteCss();
        
        const form = document.createElement('form');
        form.action = 'https://codepen.io/pen/define';
        form.method = 'POST';
        form.target = '_blank';
        
        const data = {
            title: 'Flexify Generated Layout',
            description: 'CSS Grid layout created with Flexify',
            html: htmlContent,
            css: cssContent,
            js: '// Add your JavaScript here',
            html_pre_processor: 'none',
            css_pre_processor: 'none',
            js_pre_processor: 'none',
            tags: ['flexify', 'css-grid', 'layout', 'responsive']
        };
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = JSON.stringify(data);
        
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        this.app.showToast('Opening in CodePen...', 'success');
    }
    
    // Generate different formats
    exportAsJson() {
        const layoutData = {
            metadata: {
                name: 'Flexify Layout',
                version: '1.0.0',
                created: new Date().toISOString(),
                generator: 'Flexify Visual CSS Grid Builder'
            },
            settings: {
                viewport: this.app.currentViewport,
                gridColumns: 12,
                gridRows: 8,
                gap: '16px',
                showGrid: this.app.showGrid,
                showGuides: this.app.showGuides
            },
            boxes: this.app.boxes.map(box => ({
                id: box.id,
                position: {
                    gridColumn: box.gridColumn,
                    gridRow: box.gridRow,
                    gridColumnSpan: box.gridColumnSpan,
                    gridRowSpan: box.gridRowSpan
                },
                styles: {
                    backgroundColor: box.backgroundColor,
                    padding: box.padding,
                    margin: box.margin
                }
            }))
        };
        
        const blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `flexify-layout-${Date.now()}.json`);
    }
    
    // Validation helpers
    validateLayout() {
        const errors = [];
        const warnings = [];
        
        // Check for overlapping boxes
        for (let i = 0; i < this.app.boxes.length; i++) {
            for (let j = i + 1; j < this.app.boxes.length; j++) {
                if (this.boxesOverlap(this.app.boxes[i], this.app.boxes[j])) {
                    warnings.push(`Box ${i + 1} and Box ${j + 1} are overlapping`);
                }
            }
        }
        
        // Check for boxes outside grid bounds
        this.app.boxes.forEach((box, index) => {
            if (box.gridColumn + box.gridColumnSpan - 1 > 12) {
                errors.push(`Box ${index + 1} extends beyond grid width`);
            }
            if (box.gridRow + box.gridRowSpan - 1 > 8) {
                errors.push(`Box ${index + 1} extends beyond grid height`);
            }
        });
        
        // Check for accessibility issues
        this.app.boxes.forEach((box, index) => {
            const contrast = this.calculateContrastRatio(box.backgroundColor, this.getContrastColor(box.backgroundColor));
            if (contrast < 4.5) {
                warnings.push(`Box ${index + 1} may have insufficient color contrast`);
            }
        });
        
        return { errors, warnings };
    }
    
    boxesOverlap(box1, box2) {
        const box1EndCol = box1.gridColumn + box1.gridColumnSpan - 1;
        const box1EndRow = box1.gridRow + box1.gridRowSpan - 1;
        const box2EndCol = box2.gridColumn + box2.gridColumnSpan - 1;
        const box2EndRow = box2.gridRow + box2.gridRowSpan - 1;
        
        return !(box1EndCol < box2.gridColumn || 
                box2EndCol < box1.gridColumn || 
                box1EndRow < box2.gridRow || 
                box2EndRow < box1.gridRow);
    }
    
    calculateContrastRatio(color1, color2) {
        // Simplified contrast ratio calculation
        // In a real implementation, you'd want to use WCAG guidelines
        const getLuminance = (color) => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;
            
            const sRGB = [r, g, b].map(c => {
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });
            
            return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        };
        
        const l1 = getLuminance(color1);
        const l2 = getLuminance(color2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }
}

// Initialize export controller when app is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.flexifyApp) {
        window.flexifyApp.exportController = new ExportController(window.flexifyApp);
    }
});