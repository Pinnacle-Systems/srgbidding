import React, { useState, useEffect } from 'react';
import { useGetIndentTypeMasterByNameQuery, useSaveIndentTypeMasterMutation } from '../../../redux/uniformService/IndentTypeMasterService';

const INDENT_TYPES = ["Yarn", "Fabric", "Spares", "Dyes & Chemical", "General"];
const FIELD_TYPES = ["text", "number", "date", "select"];

export default function IndentCustomFields() {
    const [selectedType, setSelectedType] = useState("Yarn");

    const { data: schemaData, isLoading, error } = useGetIndentTypeMasterByNameQuery(selectedType);
    const [saveIndentTypeMaster, { isLoading: isSaving }] = useSaveIndentTypeMasterMutation();

    const [activeSchema, setActiveSchema] = useState([]);
    console.log("schemaData fetched:", schemaData, "error:", error);

    useEffect(() => {
        if (schemaData?.data?.fieldSchema) {
            // Check if it's a string, just in case Prisma serialized it weirdly
            let parsed = schemaData.data.fieldSchema;
            if (typeof parsed === 'string') {
                try {
                    parsed = JSON.parse(parsed);
                } catch (e) { }
            }
            setActiveSchema(parsed);
        } else {
            setActiveSchema([]);
        }
    }, [schemaData, selectedType]);

    const addField = () => {
        const newField = {
            id: Date.now(),
            name: "",
            label: "",
            type: "text",
            options: ""
        };
        setActiveSchema(prev => [...prev, newField]);
    };

    const updateField = (id, key, value) => {
        setActiveSchema(prev => prev.map(field =>
            field.id === id ? { ...field, [key]: value } : field
        ));
    };

    const removeField = (id) => {
        setActiveSchema(prev => prev.filter(field => field.id !== id));
    };

    const handleSave = async () => {
        try {
            await saveIndentTypeMaster({
                name: selectedType,
                fieldSchema: activeSchema
            }).unwrap();
            alert(`Successfully saved fields for ${selectedType} Indent!`);
        } catch (error) {
            console.error("Failed to save schema", error);
            alert("Failed to save schema. Check console.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-2 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Indent Custom Fields</h1>
                    <p className="text-sm text-slate-500">Define dynamic custom fields for each Indent type.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    Save Configuration
                </button>
            </div>

            <div className="flex gap-6">
                {/* Left Sidebar - Types */}
                <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h2 className="font-semibold text-slate-700">Indent Types</h2>
                    </div>
                    <div className="p-2 space-y-1">
                        {INDENT_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${selectedType === type ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content - Schema Builder */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h2 className="font-semibold text-slate-700">Fields for {selectedType}</h2>
                        <button
                            onClick={addField}
                            className="text-sm bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Field
                        </button>
                    </div>

                    <div className="p-6">
                        {activeSchema.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p>No custom fields defined for {selectedType}.</p>
                                <p className="text-sm mt-1">Click "Add Field" to start building this form.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeSchema.map((field, index) => (
                                    <div key={field.id} className="flex gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-lg relative group">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium text-sm shrink-0 mt-0.5">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Field Label</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                                    placeholder="e.g. Yarn Count"
                                                    className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1" title="This is the JSON key stored in the database">Field Key (Internal Variable)</label>
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) => updateField(field.id, 'name', e.target.value.replace(/\s+/g, '_').toLowerCase())}
                                                    placeholder="e.g. yarn_count"
                                                    className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1">Input Type</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                                    className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {FIELD_TYPES.map(type => (
                                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {field.type === 'select' && (
                                                <div className="md:col-span-3 pt-2 border-t border-slate-200">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Dropdown Options (Comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={field.options}
                                                        onChange={(e) => updateField(field.id, 'options', e.target.value)}
                                                        placeholder="e.g. Red, Blue, Green"
                                                        className="w-full bg-white border border-slate-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => removeField(field.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Remove field"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
