
const _SQL_CUSTOMER_CACHE_ALL =
    "SELECT [CustomerID] as id ^\
        ,isnull([Status],'') as int_status ^\
        ,isnull([Name],'') as str_name ^\
        ,isnull([Gender],'') as bit_gender ^\
        ,CAST(replace(replace(replace(convert(varchar, Created, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_created_dtime ^\
        ,isnull(CAST(replace(replace(replace(convert(varchar, [Birthday], 120), '-', ''), ':', ''), ' ', '') AS bigint), 0) as int_birthday_date ^\
        ,isnull([Address],'') as str_address ^\
        ,isnull([Mobile],'') as str_phone ^\
        ,isnull([Email],'') as str_email ^\
    FROM [pos].[PawnOnlineCustomer]";

const _SQL_PAWN_CACHE_ALL =
    "SELECT TOP 100 p.PawnOnlineID as id ^\
    , isnull(p.Status, 1)           as int_status ^\
    , isnull(p.Queued, -1)          as int_queued ^\
    , isnull(p.POLRegion, 0)        as area_id ^\
    , isnull(p.ReferenceId, 0)      as ref_id ^\
    , isnull(p.ReferenceType, 0)    as int_ref_type ^\
    , isnull(p.Asset, '')           as str_asset_type ^\
    , isnull(p.Trademark, '')       as str_trademark ^\
    , isnull(p.ProductionYear, '')  as str_product_year ^\
    , isnull(p.Url, '')             as str_url ^\
    , isnull(p.Description, '')     as str_description ^\
    , CAST(replace(replace(replace(convert(varchar, p.Created, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_created_dtime ^\
    , CAST(replace(replace(replace(convert(varchar, p.RegisterDate, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_register_dtime ^\
    , isnull(p.Money, 0)            as lng_money ^\
    , isnull(p.Days, 0)             as int_days ^\
    , isnull(p.CarInBank, 0)        as bit_car_in_bank ^\
    , isnull(p.PawnID, 0)           as pos_pawn_id ^\
    , isnull(p.ShopID, 0)           as shop_id ^\
    , isnull(p.ShopCallerID, 0)     as shop_caller_id ^\
    , isnull(p.CustomerID, 0)       as customer_id ^\
    , isnull(p.RegionID, 0)         as district_id ^\
    , isnull(p.County, '')           as str_district_name ^\
    , isnull(p.Province, '')        as str_city_name ^\
FROM                                [pos].[PawnOnline] p ^\
--where p.ShopCallerID is not null and p.ShopCallerID > 0 ^\
order by p.Created desc";

const _SQL_USER_CACHE_ALL =
    "SELECT DISTINCT ^\
        u.UserID as id, ^\
        u.UserName as str_user_name, ^\
        g.[Name] as str_group_name, ^\
        u.UserFullName as str_full_name, ^\
        '12345' as str_pass_word, ^\
        (CASE ^\
                WHEN u.ApproveLevel = 1 AND UserPosition = 4 THEN N'Nhân viên cửa hàng' ^\
                WHEN u.ApproveLevel = 1 AND UserPosition = 3 THEN N'Quản lý CH' ^\
                WHEN u.ApproveLevel = 2 THEN 'QLKV' END) ^\
        as str_possition, ^\
        ug.GroupID as group_id, ^\
        s.ShopID as shop_id, ^\
        s.Name as str_shop_name ^\
    FROM pos.[User] u ^\
        INNER JOIN pos.[UserGroup] ug ON ug.UserID = u.UserID ^\
        INNER JOIN pos.[Group] g ON ug.GroupID = g.GroupID ^\
                                                            AND g.STATUS = 1 AND g.IsShop = 1 AND g.GroupID NOT IN(46) ^\
        INNER JOIN pos.[GroupShop] gs ON g.GroupID = gs.GroupID ^\
        INNER JOIN pos.[ShopDetail] s ON gs.ShopCode = s.Code AND s.OpenDate IS NOT NULL AND s.CloseDate IS NULL AND s.STATUS = 1 AND s.ShopID NOT IN(20, 154) ^\
    WHERE u.STATUS = 1 ^\
        AND(u.ApproveLevel = 1 OR u.ApproveLevel IS NULL) ^\
        --AND s.Code IN('HN01DT')";

const _URI_API_JSON = '/adm-pawn-online/api-json?token=EB976D531188435EA006FCE8769C53D5&api=';
const _URI_API_JSON_AMAZON = '/adm-pawn-online/api-json?str_connect=DB_CACHE_POS_AMAZON&token=EB976D531188435EA006FCE8769C53D5&api=';

const _CACHE_URLS = [
    //{
    //    api: 'PAWN_COLS',
    //    url: _ROOT_PATH + '/_json/pawn-grid-cols.json'
    //},
    //{
    //    api: 'PAWN',
    //    url: _URI_API_JSON_AMAZON + "PAWN&cache=false&sql=" + _SQL_PAWN_CACHE_ALL
    //},
    //{
    //    api: 'USER',
    //    url: _URI_API_JSON_AMAZON + "USER&cache=true&sql=" + _SQL_USER_CACHE_ALL
    //},
    //{
    //    api: 'CUSTOMER',
    //    url: _URI_API_JSON_AMAZON + "CUSTOMER&cache=true&sql=" + _SQL_CUSTOMER_CACHE_ALL
    //},
    //{
    //    api: 'DMVV',
    //    url: _URI_API_JSON_AMAZON + "DMVV&cache=true&sql=" + "SELECT  ROW_NUMBER() OVER(ORDER BY [ma_vv] ASC) as id, [ma_vv] as str_code, [ten_vv] as str_name FROM [dbo].[dmvv] where ten_vv2 != ''"
    //},
    //{
    //    api: 'AREA',
    //    url: _URI_API_JSON + "AREA&cache=true&sql=" + "select id,name as str_name from mobile.pol_area"
    //},
    //{
    //    api: 'STEP',
    //    url: _URI_API_JSON + "STEP&cache=true&sql=" + "select id,name as str_name from mobile.pol_step"
    //},
    //{
    //    api: 'CHANNEL',
    //    url: _URI_API_JSON_AMAZON + "CHANNEL&cache=false&sql=" + "SELECT distinct ROW_NUMBER() OVER(ORDER BY [name] ASC) as id, [name] as str_name,[Status] as [state] FROM [pos].[PawnOnlineSource] order by [name]"
    //},
    //{
    //    api: 'REGION',
    //    url: _URI_API_JSON_AMAZON + "REGION&cache=true&sql=" + "select [RegionID] as id ,[Name] as str_name, isnull([ParentID],0) as pid from pos.region"
    //},
    //{
    //    api: 'SHOP',
    //    url: _URI_API_JSON_AMAZON + "SHOP&cache=true&sql=" + "select shopid as id, code, [name] as str_name from pos.shopdetail"
    //}
];