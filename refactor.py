import os
import re

FILES = [
    "src/components/Header.js",
    "src/components/DrawerContent.js",
    "src/screens/DashboardScreen.js",
    "src/screens/ClientsScreen.js",
    "src/screens/AddClientScreen.js",
    "src/screens/SelectPlanScreen.js",
    "src/screens/PaymentScreen.js",
    "src/screens/AccountScreen.js",
    "src/screens/auth/LoginScreen.js",
    "src/screens/auth/SignupScreen.js"
]

for file_path in FILES:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Check if already refactored
    if "useTheme" in content and "getStyles(COLORS)" in content:
        continue
        
    # Import useTheme
    # find where to import
    if "react" in content:
        # Just add the import after the first import
        content = re.sub(r"(import .* from 'react'.*\n)", r"\1import { useTheme } from '../context/ThemeContext';\n", content, 1)
    else:
        content = "import { useTheme } from '../context/ThemeContext';\n" + content
        
    # For Auth screens, the path is ../../context/ThemeContext
    if "auth/" in file_path:
        content = content.replace("from '../context/ThemeContext'", "from '../../context/ThemeContext'")
        
    # Replace `const styles = StyleSheet.create({` with `const getStyles = (COLORS) => StyleSheet.create({`
    content = content.replace("const styles = StyleSheet.create({", "const getStyles = (COLORS) => StyleSheet.create({")
    
    # In the component body, we need to inject: const { colors: COLORS } = useTheme(); const styles = getStyles(COLORS);
    # Find the export default function ComponentName(props) {
    comp_match = re.search(r"export default function \w+\(.*\) \{", content)
    if comp_match:
        comp_str = comp_match.group(0)
        injection = "\n  const { colors: COLORS } = useTheme();\n  const styles = getStyles(COLORS);\n"
        content = content.replace(comp_str, comp_str + injection)
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"Refactored {file_path}")
