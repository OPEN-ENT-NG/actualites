/** Insert net-atos-entng-actualites-controllers-InfoController|getSingleInfo
    for each member/resource that has net-atos-entng-actualites-controllers-InfoController|getInfo
    This migration is needed since the new mobile API as of 1.14.0.
*/

INSERT INTO
  actualites.info_shares (member_id, resource_id, action)
SELECT
  member_id,
  resource_id,
  replace(action, 'getInfo', 'getSingleInfo')
FROM
  actualites.info_shares
WHERE
  action = 'net-atos-entng-actualites-controllers-InfoController|getInfo'
ON CONFLICT (member_id, resource_id, action) DO NOTHING;
