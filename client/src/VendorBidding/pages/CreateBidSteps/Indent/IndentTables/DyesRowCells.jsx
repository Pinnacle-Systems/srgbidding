import React from 'react';
import SearchableTableCellSelect from '../../../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import { dropDownListObject } from '../../../../../Utils/contructObject';
import { useGetItemMasterQuery } from '../../../../../redux/services/ItemMasterService';
import { useGetColorMasterQuery } from '../../../../../redux/services/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../../../redux/uniformService/UnitOfMeasurementServices';

export const DyesHeaders = ({ headerClasses }) => (
  <>
    <th className={`${headerClasses} w-52`}>Item Name</th>
    <th className={`${headerClasses} w-32`}>Make / Brand</th>
    <th className={`${headerClasses} w-32`}>Color</th>
    <th className={`${headerClasses} w-24`}>UOM</th>
  </>
);

export const DyesRowCells = ({ indent, cellClasses, inputClasses, onFieldChange, readOnly }) => {
  if (readOnly) {
    const uomName = typeof indent.uom === 'object' ? indent.uom?.name : (indent.uom || '-');
    return (
      <>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.item_name || '-'}>
          {indent.item_name || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.make || indent.brand || '-'}>
          {indent.make || indent.brand || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.shade || '-'}>
          {indent.shade || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={uomName}>
          {uomName}
        </td>
      </>
    );
  }
  const { data: itemList } = useGetItemMasterQuery({ params: {} });
  const { data: colorList } = useGetColorMasterQuery({ params: {} });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params: {} });

  const resolvedItemId =
    indent.itemId ||
    itemList?.data?.find((i) => i.name === indent.item_name)?.id ||
    '';
  const resolvedColorId =
    indent.colorId ||
    colorList?.data?.find((c) => c.name === indent.shade)?.id ||
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
          value={indent.make || indent.brand || ''}
          onChange={(e) => onFieldChange(indent, 'make', e.target.value)}
          className={inputClasses}
          placeholder="Make / Brand"
        />
      </td>
      <td className={cellClasses}>
        <SearchableTableCellSelect
          value={resolvedColorId}
          options={dropDownListObject(
            colorList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const cl = colorList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'colorId', nextVal, {
              shade: cl?.name || indent.shade,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
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

export default DyesRowCells;

