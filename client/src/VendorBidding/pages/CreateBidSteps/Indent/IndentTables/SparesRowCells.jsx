import React from 'react';
import SearchableTableCellSelect from '../../../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import { dropDownListObject } from '../../../../../Utils/contructObject';
import { useGetItemMasterQuery } from '../../../../../redux/services/ItemMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../../../redux/uniformService/UnitOfMeasurementServices';

export const SparesHeaders = ({ headerClasses }) => (
  <>
    <th className={`${headerClasses} w-48`}>Item Name</th>
    <th className={`${headerClasses} w-36`}>Machine</th>
    <th className={`${headerClasses} w-28`}>Part No</th>
    <th className={`${headerClasses} w-32`}>Make</th>
    <th className={`${headerClasses} w-24`}>UOM</th>
  </>
);

export const SparesRowCells = ({ indent, cellClasses, inputClasses, onFieldChange }) => {
  const { data: itemList } = useGetItemMasterQuery({ params: {} });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params: {} });

  const resolvedItemId =
    indent.itemId ||
    itemList?.data?.find((i) => i.name === indent.item_name)?.id ||
    '';
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
        <SearchableTableCellSelect
          value={resolvedItemId}
          options={dropDownListObject(
            itemList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const itm = itemList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'itemId', nextVal, {
              item_name: itm?.name || indent.item_name,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
        />
      </td>
      <td className={cellClasses}>
        <input
          type="text"
          value={indent.machine || ''}
          onChange={(e) => onFieldChange(indent, 'machine', e.target.value)}
          className={inputClasses}
          placeholder="Machine"
        />
      </td>
      <td className={cellClasses}>
        <input
          type="text"
          value={indent.partNo || ''}
          onChange={(e) => onFieldChange(indent, 'partNo', e.target.value)}
          className={inputClasses}
          placeholder="Part No"
        />
      </td>
      <td className={cellClasses}>
        <input
          type="text"
          value={indent.make || ''}
          onChange={(e) => onFieldChange(indent, 'make', e.target.value)}
          className={inputClasses}
          placeholder="Make"
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

export default SparesRowCells;

