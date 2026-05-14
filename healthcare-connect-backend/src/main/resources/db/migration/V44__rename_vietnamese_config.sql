-- V44__rename_vietnamese_configs.sql
UPDATE system_configs SET config_key = 'HOME_HERO_SLIDES_VI' WHERE config_key = 'HOME_HERO_SLIDES';
UPDATE system_configs SET config_key = 'HOME_FEATURES_VI' WHERE config_key = 'HOME_FEATURES';
UPDATE system_configs SET config_key = 'HOME_STATS_VI' WHERE config_key = 'HOME_STATS';
UPDATE system_configs SET config_key = 'HOME_CTA_TITLE_VI' WHERE config_key = 'HOME_CTA_TITLE';
UPDATE system_configs SET config_key = 'HOME_CTA_SUBTITLE_VI' WHERE config_key = 'HOME_CTA_SUBTITLE';
UPDATE system_configs SET config_key = 'HOME_CTA_BUTTON_TEXT_VI' WHERE config_key = 'HOME_CTA_BUTTON_TEXT';