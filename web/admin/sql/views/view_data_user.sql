DROP VIEW IF EXISTS `view_data_users`;
CREATE VIEW `view_data_users` AS (
SELECT  `exp`.`experiment_id` AS `experiment_id`,
				`exp`.`location` AS `location`,
				`ub`.`email` AS `email`,
    		`cb`.`contributor_status` as `contributor_status`,
        `data`.`hashed_user_id` as `hashed_user_id`,
        `data`.`date` as `date`,
        `data`.`filesize` as `filesize`,
        `data`.`trials` as `trials`,
        `data`.`server_status` as `server_status`,
        `data`.`storage_status` as `storage_status`,
        `data`.`backup_status` as `backup_status`,
        `data`.`data_id` as `data_id`,
        `ub`.`salt` as `salt`,
        `ub`.`password` as `password`,
        `ub`.`pepper` as `pepper`
	FROM (
    (
      `experiments` `exp`
		    JOIN `contributors` `cb`  ON (
          `exp`.`experiment_id` = `cb`.`experiment_id`
        )
    )
		JOIN `users` `ub`  ON (
      `cb`.`user_id` = `ub`.`user_id`
    )
    JOIN `data` `data` ON (
      `data`.`experiment_id` = `exp`.`experiment_id`
    )
  )
)
