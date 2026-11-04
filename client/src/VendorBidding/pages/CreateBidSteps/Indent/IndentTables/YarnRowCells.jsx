import React from 'react';
import SearchableTableCellSelect from '../../../../../HostelStore/Components/ReusableComponents/SearchableTableCellSelect';
import { dropDownListObject } from '../../../../../Utils/contructObject';
import { useGetYarnMasterQuery } from '../../../../../redux/uniformService/YarnMasterServices';
import { useGetYarnBlendMasterQuery } from '../../../../../redux/uniformService/YarnBlendMasterServices';
import { useGetCountsMasterQuery } from '../../../../../redux/uniformService/CountsMasterServices';
import { useGetColorMasterQuery } from '../../../../../redux/services/ColorMasterService';
import { useGetUnitOfMeasurementMasterQuery } from '../../../../../redux/uniformService/UnitOfMeasurementServices';

export const YarnHeaders = ({ headerClasses }) => (
  <>
    <th className={`${headerClasses} w-52`}>Yarn Name</th>
    <th className={`${headerClasses} w-44`}>Composition/Blend</th>
    <th className={`${headerClasses} w-28`}>Counts</th>
    <th className={`${headerClasses} w-32`}>Color</th>
    <th className={`${headerClasses} w-24`}>UOM</th>
  </>
);

export const YarnRowCells = ({ indent, cellClasses, onFieldChange, readOnly }) => {
  if (readOnly) {
    const uomName = typeof indent.uom === 'object' ? indent.uom?.name : (indent.uom || '-');
    return (
      <>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.item_name || indent.Yarn?.name || '-'}>
          {indent.item_name || indent.Yarn?.name || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.blend || indent.YarnBlend?.name || '-'}>
          {indent.blend || indent.YarnBlend?.name || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.count || indent.Counts?.name || '-'}>
          {indent.count || indent.Counts?.name || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={indent.shade || indent.Color?.name || '-'}>
          {indent.shade || indent.Color?.name || '-'}
        </td>
        <td className="px-2 py-1 border border-gray-300 text-[11px] text-gray-800 truncate" title={uomName}>
          {uomName}
        </td>
      </>
    );
  }
  const { data: yarnList } = useGetYarnMasterQuery({ params: {} });
  const { data: yarnBlendList } = useGetYarnBlendMasterQuery({ params: {} });
  const { data: countsList } = useGetCountsMasterQuery({ params: {} });
  const { data: colorList } = useGetColorMasterQuery({ params: {} });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({ params: {} });

  const resolvedYarnId =
    indent.yarnId ||
    yarnList?.data?.find((y) => y.name === indent.item_name)?.id ||
    '';
  const resolvedBlendId =
    indent.yarnBlendId ||
    yarnBlendList?.data?.find((b) => b.name === indent.blend)?.id ||
    '';
  const resolvedCountId =
    indent.countsId ||
    countsList?.data?.find((c) => c.name === indent.count)?.id ||
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
          value={resolvedYarnId}
          options={dropDownListObject(
            yarnList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const y = yarnList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'yarnId', nextVal, {
              item_name: y?.name || indent.item_name,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
        />
      </td>
      <td className={cellClasses}>
        <SearchableTableCellSelect
          value={resolvedBlendId}
          options={dropDownListObject(
            yarnBlendList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const b = yarnBlendList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'yarnBlendId', nextVal, {
              blend: b?.name || indent.blend,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
        />
      </td>
      <td className={cellClasses}>
        <SearchableTableCellSelect
          value={resolvedCountId}
          options={dropDownListObject(
            countsList?.data?.filter((i) => i.active !== false) || [],
            'name',
            'id'
          )}
          onChange={(nextVal) => {
            const c = countsList?.data?.find((item) => String(item.id) === String(nextVal));
            onFieldChange(indent, 'countsId', nextVal, {
              count: c?.name || indent.count,
            });
          }}
          className="border-transparent group-hover:border-gray-300 focus-within:border-blue-500"
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

export default YarnRowCells;

