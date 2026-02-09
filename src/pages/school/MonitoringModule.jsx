import React from 'react';

const MonitoringModule = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Academic Monitoring</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Updates Status</h3>
                    <p className="text-gray-500">Track which teachers have submitted their weekly logs.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Tests & Results</h3>
                    <p className="text-gray-500">Overview of recent tests and published results.</p>
                </div>
            </div>
        </div>
    );
};

export default MonitoringModule;
