import * as React from 'react';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

interface DataTableProps<T extends { id: number | string }> {
  columns: GridColDef[];
  rows: T[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: T['id']) => void;
  onSave?: (row: T) => void;
  onCancel?: () => void;
  editRowId?: T['id'] | null;
  editRow?: Partial<T>;
  setEditRow?: (row: Partial<T>) => void;
}

function DataTable<T extends { id: number | string }>(props: DataTableProps<T>) {
  const {
    columns,
    rows,
    onAdd,
    onEdit,
    onDelete,
    onSave,
    onCancel,
    editRowId,
    editRow,
    setEditRow,
  } = props;

  // Adiciona coluna de ações se handlers forem passados
  const columnsWithActions = React.useMemo(() => {
    // Evita duplicar coluna de ações
    const alreadyHasActions = columns.some(col => col.field === 'actions');
    if ((onEdit || onDelete || onSave || onCancel) && !alreadyHasActions) {
      return [
        ...columns,
        {
          field: 'actions',
          headerName: 'Ações',
          flex: 0.7,
          minWidth: 100,
          sortable: false,
          filterable: false,
          renderCell: (params: any) =>
            editRowId === params.row.id ? (
              <>
                {onSave && (
                  <IconButton color="primary" size="small" onClick={() => onSave(editRow as T)}>
                    <SaveIcon fontSize="small" />
                  </IconButton>
                )}
                {onCancel && (
                  <IconButton color="inherit" size="small" onClick={onCancel}>
                    <CancelIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ) : (
              <>
                {onEdit && (
                  <IconButton color="inherit" size="small" onClick={() => onEdit(params.row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton color="inherit" size="small" onClick={() => onDelete(params.row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            ),
        },
      ];
    }
    return columns;
  }, [columns, onEdit, onDelete, onSave, onCancel, editRowId, editRow]);

  return (
    <div style={{ height: 500, width: '100%' }}>
      {onAdd && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
          style={{ marginBottom: 12 }}
        >
          Adicionar novo registro
        </Button>
      )}
      <DataGridPro
        rows={rows}
        columns={columnsWithActions}
        pagination
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        sx={{ flex: 1 }}
      />
    </div>
  );
}

export default DataTable;
