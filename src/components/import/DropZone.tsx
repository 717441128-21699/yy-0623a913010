import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { useAppStore } from '@/store';
import { parseExcelFile, autoDetectColumns } from '@/utils/excelParser';

interface DropZoneProps {
  onParsed?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  
  const { setParsedData, setColumnMapping, setShowFieldMapper } = useAppStore();

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('请上传Excel文件（.xlsx, .xls, .csv格式）');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);

    try {
      const { headers, rows } = await parseExcelFile(file);
      const mapping = autoDetectColumns(headers);
      
      setParsedData(headers, rows);
      setColumnMapping(mapping);
      setShowFieldMapper(true);
      onParsed?.();
    } catch (err) {
      setError((err as Error).message);
      setSelectedFile(null);
    } finally {
      setIsParsing(false);
    }
  }, [setParsedData, setColumnMapping, setShowFieldMapper, onParsed]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
          }
        `}
      >
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {isParsing ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">正在解析文件...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <FileSpreadsheet className="w-10 h-10 text-primary-500" />
            <div>
              <p className="text-sm font-medium text-neutral-500">{selectedFile.name}</p>
              <p className="text-xs text-neutral-300">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="mt-2 text-xs text-danger-500 hover:text-danger-600 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> 重新选择
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className={`w-10 h-10 ${isDragging ? 'text-primary-500' : 'text-neutral-300'}`} />
            <div>
              <p className="text-sm font-medium text-neutral-500">
                拖拽Excel文件到此处，或点击选择
              </p>
              <p className="text-xs text-neutral-300 mt-1">
                支持 .xlsx, .xls, .csv 格式
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-danger-50 text-danger-500 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="text-xs text-neutral-300">
        <p className="font-medium mb-1">Excel文件应包含以下列：</p>
        <p>品牌、规格、批号、数量、到期日、进价（可选）</p>
        <p className="mt-1">系统会自动识别列名，也可手动调整映射关系</p>
      </div>
    </div>
  );
};
