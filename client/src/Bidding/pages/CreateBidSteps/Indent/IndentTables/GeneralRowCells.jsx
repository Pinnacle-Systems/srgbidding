import React from 'react';
import SearchableTableCellSelect from '../../../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import { dropDownListObject } from '../../../../../Utils/contructObject';
import { useGetUnitOfMeasurementMasterQuery } from '../../../../../redux/uniformService/UnitOfMeasurementServices';

export const GeneralHeaders = ({ headerClasses }) => (
  <>
    <th className={`${headerClasses} w-48`}>Item Name</th>
    <th className={`${headerClasses} w-32`}>Department</th>
    <th className={`${headerClasses} w-44`}>Specification</th>
    <th className={`${headerClasses} w-24`}>UOM</th>
  </>
);

export const GeneralRowCells = ({ indent, cellClasses, inputClasses, onFieldChange }) => {
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params: {} });

  const resolvedUomId =
    indent.uomId ||
    uomList?.data?.find(
      (u) =>
        u.name?.toLowerCase() ===
        (typeof indent.uom === 'object' ? indent.uom?.name : indent.uom)?.toLowerCase()
    )?.id ||
    '';

  return (
    <>
      <td className={cellClasses}>
        <input
          type="text"
          value={indent.item_name || ''}
          onChange={(e) => onFieldChange(indent, 'item_name', e.target.value)}
          className={inputClasses}
          placeholder="Item Name"
        />
      </td>
      <td className={cellClasses}>
        <input
          type="text"
          value={typeof indent.department === 'object' ? indent.department?.name : (indent.department || '')}
          onChange={(e) => onFieldChange(indent, 'department', e.target.value)}
          className={inputClasses}
          placeholder="Department"
        />
      </td>
      <td className={cellClasses}>
        <input
          type="text"
          value={indent.spec || ''}
          onChange={(e) => onFieldChange(indent, 'spec', e.target.value)}
          className={inputClasses}
          placeholder="Specification"
        />
      </td>
      <td className={cellClasses}>
        <SearchableTableCellSelect
          value={resolvedUomId}
          options={dropDownListObject(
            uomList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const u = uomList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'uomId', nextVal, {
              uom: u?.name || indent.uom,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
        />
      </td>
    </>
  );
};

export default GeneralRowCells;

