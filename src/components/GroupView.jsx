import React, { useState, useEffect } from 'react';
import TabItem from './TabItem';
import { getAllTabs, closeTab, switchToTab, groupTabsByDomain, isChromeExtension } from '../utils/chromeAPI';

const GroupView = ({ searchQuery }) => {
  const [groupedTabs, setGroupedTabs] = useState({});

  useEffect(() => {
    loadAndGroupTabs();
  }, []);

  const loadAndGroupTabs = async () => {
    const allTabs = await getAllTabs();
    const grouped = groupTabsByDomain(allTabs);
    setGroupedTabs(grouped);
  };

  const handleCloseTab = async (tabId) => {
    await closeTab(tabId);
    loadAndGroupTabs();
  };

  const handleSwitchTab = async (tab) => {
    await switchToTab(tab.id, tab.url);
    if (isChromeExtension()) window.close();
  };

  const filteredGroups = Object.entries(groupedTabs)
    .map(([domain, tabs]) => [
      domain,
      tabs.filter((tab) =>
        tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tab.url.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    ])
    .filter(([, tabs]) => tabs.length > 0);

  return (
    <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
      {filteredGroups.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No tabs found</p>
        </div>
      ) : filteredGroups.map(([domain, tabs]) => (
        <div key={domain} className="mb-4">
          <div className="bg-gray-100 px-4 py-2 font-semibold text-sm text-gray-700 flex justify-between items-center">
            <span>{domain}</span>
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              {tabs.length}
            </span>
          </div>
          {tabs.map(tab => (
            <TabItem 
              key={tab.id} 
              tab={tab} 
              onClose={handleCloseTab}
              onSwitch={handleSwitchTab}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GroupView;
