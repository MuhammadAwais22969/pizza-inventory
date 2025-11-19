import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Plus, 
  Trash2, 
  Minus, 
  X, 
  AlertTriangle, 
  Sparkles,
  Send,
  MessageSquare,
  Edit,
  DollarSign,
  Search,        
  Filter,        
  Download,      
  FileSpreadsheet, 
  FileText       
} from 'lucide-react';

// Request notification permission when app loads
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// Sample inventory data with costs
const INITIAL_INVENTORY = [
  { id: '1', name: "Pizza Dough", stock: 50, unit: "units", threshold: 10, cost: 1000 },
  { id: '2', name: "Mozzarella Cheese", stock: 20, unit: "kg", threshold: 5, cost: 250 },
  { id: '3', name: "Tomato Sauce", stock: 15, unit: "liters", threshold: 5, cost: 100 },
  { id: '4', name: "Pepperoni", stock: 10, unit: "kg", threshold: 2, cost: 120 },
  { id: '5', name: "Beverages", stock: 15, unit: "liters", threshold: 10, cost: 100 },
  { id: '6', name: "Olives", stock: 3, unit: "kg", threshold: 2, cost: 700 },
  { id: '7', name: "Onions", stock: 10, unit: "kg", threshold: 3, cost: 150 },
  { id: '8', name: "Green Peppers", stock: 7, unit: "kg", threshold: 2, cost: 350 },
  { id: '9', name: "Pizza Boxes", stock: 70, unit: "units", threshold: 20, cost: 50 },
];

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const AIAgentInput = ({ inventory, onUpdateStock }) => {
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = () => {
    if (!inputText.trim()) return;

    const text = inputText.toLowerCase();
    let processed = false;

    inventory.forEach(item => {
      if (text.includes(item.name.toLowerCase())) {
        if (text.includes('bought') || text.includes('received') || text.includes('add')) {
          const match = text.match(/(\d+(\.\d+)?)/);
          if (match) {
            onUpdateStock(item.id, { stock: item.stock + parseFloat(match[1]) });
            setFeedback({ type: 'success', message: `Added ${match[1]} ${item.unit} of ${item.name}!` });
            processed = true;
          }
        } else if (text.includes('used') || text.includes('sold')) {
          const match = text.match(/(\d+(\.\d+)?)/);
          if (match) {
            onUpdateStock(item.id, { stock: Math.max(0, item.stock - parseFloat(match[1])) });
            setFeedback({ type: 'success', message: `Removed ${match[1]} ${item.unit} of ${item.name}!` });
            processed = true;
          }
        }
      }
    });

    if (!processed) {
      setFeedback({ type: 'error', message: "I couldn't understand that. Try: 'bought 5 kg of onions' or 'used 2 liters of sauce'" });
    }

    setInputText('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
        <Sparkles className="mr-2 text-green-500" size={24} />
        AI Agent Command Center
      </h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g., 'bought 5 kg of onions' or 'used 2 liters of sauce'"
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button onClick={handleSubmit} className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-14 h-14 flex items-center justify-center">
          <Send size={24} />
        </button>
      </div>
      {feedback && (
        <div className={`mt-4 p-3 rounded-md text-sm flex items-center justify-between ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <div className="flex items-center">
            <MessageSquare size={16} className="mr-2" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 rounded-full hover:bg-black/10">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const ItemForm = ({ itemToEdit, onSave, onClose }) => {
  const [name, setName] = useState(itemToEdit?.name || '');
  const [stock, setStock] = useState(itemToEdit?.stock || 0);
  const [unit, setUnit] = useState(itemToEdit?.unit || 'units');
  const [threshold, setThreshold] = useState(itemToEdit?.threshold || 5);
  const [cost, setCost] = useState(itemToEdit?.cost || 0);

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      stock: Number(stock) || 0,
      unit: unit.trim() || 'units',
      threshold: Number(threshold) || 0,
      cost: Number(cost) || 0,
    });
  };

  return (
    <Modal show={true} onClose={onClose} title={itemToEdit ? "Edit Inventory Item" : "Add New Inventory Item"}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mozzarella Cheese"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(parseFloat(e.target.value) || 0)} min="0" step="0.1"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g., kg"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input type="number" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)} min="0" step="0.1"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (Rs.)</label>
            <input type="number" value={cost} onChange={(e) => setCost(parseFloat(e.target.value) || 0)} min="0" step="0.01"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
            {itemToEdit ? "Save Changes" : <><Plus size={18} className="mr-1" /> Add Item</>}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const InventoryItem = ({ item, onUpdateStock, onDelete, onEdit }) => {
  const isLowStock = item.stock < item.threshold;
  const itemValue = (item.stock || 0) * (item.cost || 0);

  const handleStockChange = (amount) => {
    onUpdateStock(item.id, { stock: Math.max(0, item.stock + amount) });
  };

  return (
    <li className={`bg-white shadow-md rounded-lg p-4 transition-all ${isLowStock ? 'bg-red-50 border-2 border-red-300' : 'border border-gray-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span className="text-green-600 font-medium">Rs. {item.cost.toFixed(2)} / {item.unit}</span>
            <span>&bull;</span>
            <span>Total Value: Rs. {itemValue.toFixed(2)}</span>
          </div>
          {isLowStock && (
            <div className="flex items-center text-red-600 text-sm font-medium mt-1">
              <AlertTriangle size={16} className="mr-1" />Low Stock
            </div>
          )}
        </div>
        
        <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex flex-col items-start sm:items-end">
          <div className="flex items-center justify-center space-x-2">
            <button onClick={() => handleStockChange(-1)} disabled={item.stock <= 0}
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Minus size={16} />
            </button>
            <span className="text-xl font-bold text-gray-800 w-24 text-center">
              {item.unit === 'units' ? item.stock : item.stock.toFixed(1)} 
              <span className="text-sm font-normal text-gray-500 ml-1">{item.unit}</span>
            </span>
            <button onClick={() => handleStockChange(1)} className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <span className="text-xs text-gray-500 mt-1">Threshold: {item.threshold} {item.unit}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
        <button onClick={() => onEdit(item)} className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-md transition-colors flex items-center">
          <Edit size={14} className="mr-1" />Edit
        </button>
        <button onClick={() => onDelete(item.id)} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-md transition-colors flex items-center">
          <Trash2 size={14} className="mr-1" />Delete
        </button>
      </div>
    </li>
  );
};

const Dashboard = ({ inventory }) => {
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.stock < item.threshold).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.cost), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold mt-1">{totalItems}</p>
          </div>
          <Boxes size={40} className="opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Low Stock Alerts</p>
            <p className="text-3xl font-bold mt-1">{lowStockItems}</p>
          </div>
          <AlertTriangle size={40} className="opacity-80" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Inventory Value</p>
            <p className="text-3xl font-bold mt-1">Rs. {totalValue.toFixed(2)}</p>
          </div>
          <DollarSign size={40} className="opacity-80" />
        </div>
      </div>
    </div>
  );
};

const SearchAndFilter = ({ inventory, onFilterChange, searchTerm, setSearchTerm, filterType, setFilterType }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items by name..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="md:w-64">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Items</option>
              <option value="lowStock">Low Stock Only</option>
              <option value="inStock">In Stock</option>
              <option value="highValue">High Value (Rs. 100+)</option>
            </select>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="md:w-64">
          <select
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="name-asc">Sort: A to Z</option>
            <option value="name-desc">Sort: Z to A</option>
            <option value="stock-asc">Sort: Stock Low to High</option>
            <option value="stock-desc">Sort: Stock High to Low</option>
            <option value="value-asc">Sort: Value Low to High</option>
            <option value="value-desc">Sort: Value High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filterType !== 'all') && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              Search: "{searchTerm}"
              <button onClick={() => setSearchTerm('')} className="hover:bg-blue-200 rounded-full p-0.5">
                <X size={12} />
              </button>
            </span>
          )}
          {filterType !== 'all' && (
            <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
              {filterType === 'lowStock' && 'Low Stock'}
              {filterType === 'inStock' && 'In Stock'}
              {filterType === 'highValue' && 'High Value'}
              <button onClick={() => setFilterType('all')} className="hover:bg-purple-200 rounded-full p-0.5">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const ExportButtons = ({ inventory }) => {
  
  // NEW: Simple CSV Export function
  const exportToCSV = () => {
    // 1. Define Headers
    const headers = ['Item Name', 'Stock', 'Unit', 'Cost per Unit (Rs.)', 'Total Value (Rs.)', 'Threshold', 'Status'];
    
    // 2. Convert data to CSV rows
    const rows = inventory.map(item => {
      const status = item.stock < item.threshold ? 'Low Stock' : 'In Stock';
      const totalValue = (item.stock * item.cost).toFixed(2);
      
      // Escape commas in name by wrapping in quotes
      const name = `"${item.name.replace(/"/g, '""')}"`; 
      
      return [name, item.stock, item.unit, item.cost, totalValue, item.threshold, status].join(',');
    });
    
    // 3. Join all rows with newline characters
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // 4. Create a Blob (a file in memory)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 5. Create a temporary link to download the file
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // 6. Add link to page, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Create printable HTML content
    const printWindow = window.open('', '', 'width=800,height=600');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inventory Report - Toss in F11</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2d3748; border-bottom: 3px solid #48bb78; padding-bottom: 10px; }
          .summary { background: #f7fafc; padding: 15px; margin: 20px 0; border-radius: 8px; }
          .summary-item { display: inline-block; margin-right: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #48bb78; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f7fafc; }
          .low-stock { background: #fed7d7 !important; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🍕 Toss in F11 - Inventory Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="summary">
          <div class="summary-item"><strong>Total Items:</strong> ${inventory.length}</div>
          <div class="summary-item"><strong>Low Stock Items:</strong> ${inventory.filter(i => i.stock < i.threshold).length}</div>
          <div class="summary-item"><strong>Total Value:</strong> Rs. ${inventory.reduce((sum, i) => sum + (i.stock * i.cost), 0).toFixed(2)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Cost/Unit</th>
              <th>Total Value</th>
              <th>Threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${inventory.map(item => `
              <tr class="${item.stock < item.threshold ? 'low-stock' : ''}">
                <td>${item.name}</td>
                <td>${item.stock}</td>
                <td>${item.unit}</td>
                <td>Rs. ${item.cost.toFixed(2)}</td>
                <td>Rs. ${(item.stock * item.cost).toFixed(2)}</td>
                <td>${item.threshold}</td>
                <td>${item.stock < item.threshold ? '⚠️ Low Stock' : '✅ In Stock'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>© 2025 Toss in F11 - Pizza Restaurant Inventory Management System</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={exportToCSV} // Changed to call exportToCSV
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <FileSpreadsheet size={20} />
          Export to CSV (for Excel)
        </button>
        <button
          onClick={exportToPDF}
          className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <FileText size={20} />
          Export to PDF
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">Download your inventory data as CSV or print as PDF</p>
    </div>
  );
};

const LowStockAlertPanel = ({ inventory }) => {
  const lowStockItems = inventory.filter(item => item.stock < item.threshold);
  
  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-lg animate-pulse">
      <div className="flex items-center mb-3">
        <AlertTriangle className="text-red-500 mr-2" size={24} />
        <h3 className="text-lg font-semibold text-red-800">
          ⚠️ Low Stock Alerts ({lowStockItems.length})
        </h3>
      </div>
      <div className="space-y-2">
        {lowStockItems.map(item => (
          <div key={item.id} className="bg-white p-3 rounded-md flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-800">{item.name}</span>
              <span className="text-sm text-gray-600 ml-2">
                ({item.stock} {item.unit} remaining - needs {item.threshold} {item.unit})
              </span>
            </div>
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
              Restock Needed
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PizzaInventorySystem() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [notifiedItems, setNotifiedItems] = useState(new Set());
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('name-asc');

  // REMOVED: No longer need isXlsxLoaded state

  // REMOVED: No longer need the useEffect for loading the script

  // Check for low stock and send notifications
  useEffect(() => {
    const lowStockItems = inventory.filter(item => item.stock < item.threshold);
    
    lowStockItems.forEach(item => {
      if (!notifiedItems.has(item.id) && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('🍕 Low Stock Alert!', {
          body: `${item.name} is running low! Only ${item.stock} ${item.unit} left (threshold: ${item.threshold} ${item.unit})`,
          icon: '🍕',
          tag: item.id,
        });
        
        setNotifiedItems(prev => new Set([...prev, item.id]));
      }
    });
    
    inventory.forEach(item => {
      if (item.stock >= item.threshold && notifiedItems.has(item.id)) {
        setNotifiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      }
    });
  }, [inventory, notifiedItems]);

  // Filter and Search Logic
  const getFilteredInventory = () => {
    let filtered = [...inventory];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filter type
    switch (filterType) {
      case 'lowStock':
        filtered = filtered.filter(item => item.stock < item.threshold);
        break;
      case 'inStock':
        filtered = filtered.filter(item => item.stock >= item.threshold);
        break;
      case 'highValue':
        filtered = filtered.filter(item => (item.stock * item.cost) >= 100);
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortType) {
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'stock-asc':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-desc':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      case 'value-asc':
        filtered.sort((a, b) => (a.stock * a.cost) - (b.stock * b.cost));
        break;
      case 'value-desc':
        filtered.sort((a, b) => (b.stock * b.cost) - (a.stock * a.cost));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredInventory = getFilteredInventory();

  const handleUpdateStock = (id, updates) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSaveItem = (itemData) => {
    if (editingItem) {
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...itemData } : item
      ));
      setEditingItem(null);
    } else {
      setInventory(prev => [...prev, { ...itemData, id: Date.now().toString() }]);
      setShowAddForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🍕 Toss in F11 - Inventory Manager</h1>
          <p className="text-gray-600">AI-powered inventory management for your pizza restaurant</p>
        </div>

        <Dashboard inventory={inventory} />
        
        <LowStockAlertPanel inventory={inventory} />

        {/* This component no longer needs the isXlsxLoaded prop */}
        <ExportButtons inventory={inventory} />

        {/* Search and Filter */}
        <SearchAndFilter
          inventory={inventory}
          onFilterChange={setSortType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
        />

        <AIAgentInput inventory={inventory} onUpdateStock={handleUpdateStock} />

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Current Inventory 
              {filteredInventory.length !== inventory.length && (
                <span className="text-sm text-gray-500 ml-2">
                  ({filteredInventory.length} of {inventory.length} items)
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add New Item
            </button>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">No Items Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredInventory.map(item => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onUpdateStock={handleUpdateStock}
                  onDelete={handleDelete}
                  onEdit={setEditingItem}
                />
              ))}
            </ul>
          )}
        </div>

        {(showAddForm || editingItem) && (
          <ItemForm
            itemToEdit={editingItem}
            onSave={handleSaveItem}
            onClose={() => {
              setShowAddForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
}