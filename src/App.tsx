import { useState } from 'react';
import PayeeAddressBook from './components/PayeeAddressBook';
import AddNewPayee from './components/AddNewPayee';

type TabType = 'address-book' | 'add-payee';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('address-book');

  return (
    <div>
      <header className="app-header">
        <div className="app-container">
          <h1>PayID Address Book</h1>
        </div>
      </header>
      
      <main className="app-container">
        <nav className="tab-container" role="tablist" aria-label="PayID Address Book Navigation">
          <ul className="tab-list">
            <li role="presentation">
              <button
                className={`tab-button ${activeTab === 'address-book' ? 'active' : ''}`}
                role="tab"
                aria-selected={activeTab === 'address-book'}
                aria-controls="address-book-panel"
                id="address-book-tab"
                onClick={() => setActiveTab('address-book')}
              >
                Payee Address Book
              </button>
            </li>
            <li role="presentation">
              <button
                className={`tab-button ${activeTab === 'add-payee' ? 'active' : ''}`}
                role="tab"
                aria-selected={activeTab === 'add-payee'}
                aria-controls="add-payee-panel"
                id="add-payee-tab"
                onClick={() => setActiveTab('add-payee')}
              >
                Add New Payee
              </button>
            </li>
          </ul>
        </nav>

        <div className="tab-content">
          {activeTab === 'address-book' && (
            <div
              role="tabpanel"
              id="address-book-panel"
              aria-labelledby="address-book-tab"
            >
              <PayeeAddressBook />
            </div>
          )}
          
          {activeTab === 'add-payee' && (
            <div
              role="tabpanel"
              id="add-payee-panel"
              aria-labelledby="add-payee-tab"
            >
              <AddNewPayee />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
