
SELECT TOP 100 p.PawnOnlineID as id 
    , isnull(p.Status, 1)           as int_status 
    , isnull(p.Queued, -1)          as int_queued 
    , isnull(p.POLRegion, 0)        as area_id 
    , isnull(p.ReferenceId, 0)      as ref_id 
    , isnull(p.ReferenceType, 0)    as int_ref_type 
    , isnull(p.Asset, '')           as str_asset_type 
    , isnull(p.Trademark, '')       as str_trademark 
    , isnull(p.ProductionYear, '')  as str_product_year 
    , isnull(p.Url, '')             as str_url 
    , isnull(p.Description, '')     as str_description 
    , CAST(replace(replace(replace(convert(varchar, p.Created, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_created_dtime 
    , CAST(replace(replace(replace(convert(varchar, p.RegisterDate, 120), '-', ''), ':', ''), ' ', '') AS bigint) as lng_register_dtime 
    , isnull(p.Money, 0)            as lng_money 
    , isnull(p.Days, 0)             as int_days 
    , isnull(p.CarInBank, 0)        as bit_car_in_bank 
    , isnull(p.PawnID, 0)           as pos_pawn_id 
    , isnull(p.ShopID, 0)           as shop_id 
    , isnull(p.ShopCallerID, 0)     as shop_caller_id 
    , isnull(p.CustomerID, 0)       as customer_id 
    , isnull(p.RegionID, 0)         as district_id 
    , isnull(p.County, '')           as str_district_name 
    , isnull(p.Province, '')        as str_city_name 

FROM                                [pos].[PawnOnline] p 
--where p.ShopCallerID is not null and p.ShopCallerID > 0 