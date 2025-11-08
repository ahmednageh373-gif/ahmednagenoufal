# 🤝 Contributing to Construction Scheduling System

Thank you for considering contributing to this project! We welcome contributions from everyone.

## 🌟 Ways to Contribute

### 1. Report Bugs
- Use GitHub Issues
- Include detailed description
- Provide steps to reproduce
- Include environment details

### 2. Suggest Features
- Open a GitHub Issue with tag `enhancement`
- Describe the feature clearly
- Explain use cases and benefits

### 3. Submit Code
- Fix bugs
- Add new features
- Improve documentation
- Write tests

## 🔧 Development Setup

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR-USERNAME/ahmednagenoufal.git
cd ahmednagenoufal
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
pip install -e .  # Install in editable mode
```

### 4. Run Tests
```bash
pytest tests/
```

## 📝 Coding Standards

### Python Style
- Follow PEP 8
- Use type hints
- Write docstrings (Google style)
- Keep functions small and focused

### Example
```python
def calculate_duration(quantity: float, rate: float, shifts: int = 1) -> float:
    """
    Calculate activity duration based on quantity and productivity rate.
    
    Args:
        quantity: Total quantity to execute
        rate: Productivity rate (units/day)
        shifts: Number of shifts (1, 2, or 3)
    
    Returns:
        Duration in days
    
    Raises:
        ValueError: If rate is zero or negative
    """
    if rate <= 0:
        raise ValueError("Rate must be positive")
    
    shift_factor = {1: 1.0, 2: 0.6, 3: 0.45}.get(shifts, 1.0)
    return (quantity / rate) / shift_factor
```

### Commit Messages
Use conventional commit format:
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(cpm): add support for SF (Start-to-Finish) logic

fix(export): correct Excel date formatting issue

docs(api): update REST API examples
```

## 🔄 Pull Request Process

### 1. Create Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Write code
- Add tests
- Update documentation

### 3. Test
```bash
# Run all tests
pytest tests/

# Run specific test
pytest tests/test_cpm_engine.py

# Check code style
flake8 backend/
black --check backend/

# Type checking
mypy backend/
```

### 4. Commit
```bash
git add .
git commit -m "feat(scheduler): add multi-project support"
```

### 5. Push
```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to GitHub repository
- Click "New Pull Request"
- Select your branch
- Fill in PR template
- Wait for review

## ✅ Pull Request Checklist

Before submitting, ensure:
- [ ] Code follows project style
- [ ] Tests are passing
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Changes are focused and minimal

## 🧪 Testing Guidelines

### Unit Tests
```python
def test_calculate_duration():
    """Test duration calculation with different shifts"""
    # Arrange
    quantity = 100.0
    rate = 40.0
    
    # Act
    duration_1_shift = calculate_duration(quantity, rate, shifts=1)
    duration_2_shifts = calculate_duration(quantity, rate, shifts=2)
    
    # Assert
    assert duration_1_shift == 2.5
    assert duration_2_shifts == 1.5  # 2.5 * 0.6
```

### Integration Tests
```python
def test_full_schedule_generation():
    """Test complete schedule generation workflow"""
    from datetime import datetime
    from backend.scheduling.cpm_engine import build_schedule_from_boq
    from backend.data.activity_breakdown_rules import CONCRETE_SLAB_100M3
    
    cpm = build_schedule_from_boq(
        boq_breakdown=CONCRETE_SLAB_100M3,
        project_start_date=datetime(2025, 1, 1),
        shifts=1
    )
    
    assert cpm.project_duration > 0
    assert len(cpm.critical_path) > 0
    assert all(act.is_critical for aid in cpm.critical_path 
               for act in [cpm.activities[aid]])
```

## 📚 Adding New BOQ Items

### 1. Define in `activity_breakdown_rules.py`
```python
NEW_BOQ_ITEM = BOQBreakdown(
    boq_code="NEW-001",
    boq_description="Description",
    total_quantity=100.0,
    unit="m²",
    category="Category",
    sub_activities=[
        SubActivity(
            code="NEW-001-A",
            name_ar="اسم النشاط",
            name_en="Activity Name",
            unit="m²",
            productivity=ProductivityRate(
                rate_per_day=50.0,
                unit="m²/day",
                crew=CrewComposition(...)
            ),
            activity_type=ActivityType.NORMAL,
            logic_links=[],
            remarks="Notes"
        ),
        # More sub-activities...
    ]
)

ALL_BOQ_BREAKDOWNS["NEW-001"] = NEW_BOQ_ITEM
```

### 2. Add Tests
```python
def test_new_boq_item():
    """Test new BOQ item generation"""
    cpm = build_schedule_from_boq(
        boq_breakdown=NEW_BOQ_ITEM,
        project_start_date=datetime(2025, 1, 1),
        shifts=1
    )
    
    assert cpm.project_duration > 0
    # More assertions...
```

### 3. Update Documentation
- Add to README.md table
- Update SCHEDULE_SYSTEM_GUIDE.md
- Include in API examples

## 🌍 Internationalization

### Adding Translations
```python
# In activity definition
SubActivity(
    name_ar="اسم بالعربية",  # Arabic name
    name_en="English Name",   # English name
    # ...
)
```

## 📧 Questions?

- Open a GitHub Discussion
- Contact: [@ahmednageh373-gif](https://github.com/ahmednageh373-gif)

## 📜 Code of Conduct

Be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

---

**Thank you for contributing! 🎉**
