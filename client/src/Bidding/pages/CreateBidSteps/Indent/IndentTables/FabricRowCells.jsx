import React from 'react';
import SearchableTableCellSelect from '../../../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import { dropDownListObject } from '../../../../../Utils/contructObject';
import { useGetFabricMasterQuery } from '../../../../../redux/services/FabricMasterService';
import { useGetGsmMasterQuery } from '../../../../../redux/services/GsmMasterService';
import { useGetColorMasterQuery } from '../../../../../redux/services/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../../../redux/uniformService/UnitOfMeasurementServices';

export const FabricHeaders = ({ headerClasses }) => (
  <>
    <th className={`${headerClasses} w-52`}>Fabric Name</th>
    <th className={`${headerClasses} w-28`}>GSM</th>
    <th className={`${headerClasses} w-24`}>Width</th>
    <th className={`${headerClasses} w-32`}>Color</th>
    <th className={`${headerClasses} w-24`}>UOM</th>
  </>
);

export const FabricRowCells = ({ indent, cellClasses, inputClasses, onFieldChange }) => {
  const { data: fabricList } = useGetFabricMasterQuery({ params: {} });
  const { data: gsmList } = useGetGsmMasterQuery({ params: {} });
  const { data: colorList } = useGetColorMasterQuery({ params: {} });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params: {} });

  const resolvedFabricId =
    indent.fabricId ||
    fabricList?.data?.find((f) => f.name === indent.item_name)?.id ||
    '';
  const resolvedGsmId =
    indent.gsmId ||
    gsmList?.data?.find((g) => String(g.name) === String(indent.gsm))?.id ||
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
          value={resolvedFabricId}
          options={dropDownListObject(
            fabricList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const f = fabricList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'fabricId', nextVal, {
              item_name: f?.name || indent.item_name,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
        />
      </td>
      <td className={cellClasses}>
        <SearchableTableCellSelect
          value={resolvedGsmId}
          options={dropDownListObject(
            gsmList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const g = gsmList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'gsmId', nextVal, {
              gsm: g?.name || indent.gsm,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
        />
      </td>
      <td className={cellClasses}>
        <input
          type="text"
          value={indent.width || ''}
          onChange={(e) => onFieldChange(indent, 'width', e.target.value)}
          className={inputClasses}
          placeholder="Width"
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

export default FabricRowCells;

