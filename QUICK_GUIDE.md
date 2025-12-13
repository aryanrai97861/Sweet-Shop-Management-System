# Sweet Shop - Quick Guide

## 🎯 How to Add Sweets with Different Categories

### Step 1: Login as Admin
- Username: `admin`
- Password: `admin123`

### Step 2: Go to Admin Panel
- Click "Admin" in the top navigation

### Step 3: Add Sweets
- Click the "Add Sweet" button
- Fill in the form with these available categories:
  - **Chocolate**
  - **Candy**
  - **Gummies**
  - **Cookies**
  - **Cake**
  - **Pastry**

### Example Sweets to Add:

#### Sweet 1: Milk Chocolate Bar
- Name: Milk Chocolate Bar
- Category: Chocolate
- Price: 2.50
- Quantity: 50
- Description: Smooth and creamy milk chocolate

#### Sweet 2: Gummy Bears
- Name: Gummy Bears
- Category: Gummies
- Price: 1.50
- Quantity: 100
- Description: Fruit-flavored gummy bears

#### Sweet 3: Chocolate Chip Cookies
- Name: Chocolate Chip Cookies
- Category: Cookies
- Price: 3.00
- Quantity: 30
- Description: Fresh baked cookies with chocolate chips

#### Sweet 4: Red Velvet Cake
- Name: Red Velvet Cake
- Category: Cake
- Price: 15.00
- Quantity: 10
- Description: Moist red velvet cake with cream cheese frosting

#### Sweet 5: Croissant
- Name: Butter Croissant
- Category: Pastry
- Price: 2.00
- Quantity: 25
- Description: Flaky, buttery French croissant

## 🔍 Using the Search & Filter

### On the Shop Page (Home):

1. **Search by Name**: Type in the search box (e.g., "chocolate")
2. **Filter by Category**: Select a category from the dropdown (shows only categories that have sweets)
3. **Price Range**: Enter min and max prices
4. **Apply Filters**: Click the "Search" button
5. **Clear Filters**: Click "Clear" to reset all filters

### How Filtering Works:

- **Category dropdown shows only existing categories** - If you only have "Candy" sweets, only "Candy" will appear
- **Add sweets in different categories** to see more options in the filter
- The filter combines all search criteria (name AND category AND price range)

## ✅ What I Fixed:

1. ✅ Categories now refresh when you add/update/delete sweets
2. ✅ Search queries properly invalidate and refresh
3. ✅ Purchase updates all relevant queries
4. ✅ Admin panel has all 6 predefined categories available

## 🎨 Tips:

- Add at least one sweet in each category to see all filters working
- Categories are dynamic - they only show up in filters if sweets exist in that category
- The admin panel always shows all 6 categories regardless of what's in stock
