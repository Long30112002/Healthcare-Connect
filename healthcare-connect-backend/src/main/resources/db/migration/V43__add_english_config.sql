-- Thêm các config cho tiếng Anh (suffix _EN)
-- HOME - Hero Slides (English)
INSERT INTO system_configs (config_key, config_value, config_type, group_name, display_name, display_order) VALUES
    ('HOME_HERO_SLIDES_EN', '[
    {"id":1,"title":"Comprehensive Healthcare","subtitle":"Easy appointment booking","description":"Connect with top doctors","icon":"🏥","bgGradient":"from-blue-600 to-cyan-500"},
    {"id":2,"title":"24/7 Online Consultation","subtitle":"Doctors ready to answer","description":"Ask questions and get remote consultation","icon":"💬","bgGradient":"from-green-600 to-teal-500"},
    {"id":3,"title":"Quick Booking","subtitle":"Save waiting time","description":"Choose doctor, pick time, confirm instantly","icon":"📅","bgGradient":"from-purple-600 to-pink-500"}
]', 'JSON', 'HOME', 'Hero Slides EN', 1)
ON CONFLICT (config_key) DO NOTHING;

-- HOME - Features (English)
INSERT INTO system_configs (config_key, config_value, config_type, group_name, display_name, display_order) VALUES
    ('HOME_FEATURES_EN', '[
    {"icon":"👨‍⚕️","title":"Expert Doctors","desc":"Hundreds of highly qualified doctors","color":"from-blue-500 to-cyan-500"},
    {"icon":"📅","title":"Easy Booking","desc":"Choose doctor, pick time, confirm instantly","color":"from-green-500 to-teal-500"},
    {"icon":"💊","title":"E-Prescription","desc":"Receive digital prescription after consultation","color":"from-purple-500 to-pink-500"},
    {"icon":"🤖","title":"AI Assistant","desc":"Specialty suggestions based on symptoms","color":"from-orange-500 to-red-500"},
    {"icon":"🏥","title":"Multi-Hospital","desc":"Connect with hundreds of hospitals nationwide","color":"from-indigo-500 to-blue-500"},
    {"icon":"⭐","title":"Transparent Reviews","desc":"Real reviews from real patients","color":"from-yellow-500 to-amber-500"}
]', 'JSON', 'HOME', 'Features EN', 2)
ON CONFLICT (config_key) DO NOTHING;

-- HOME - Stats (English)
INSERT INTO system_configs (config_key, config_value, config_type, group_name, display_name, display_order) VALUES
    ('HOME_STATS_EN', '[
    {"value":"500+","label":"Doctors","icon":"👨‍⚕️"},
    {"value":"50K+","label":"Patients","icon":"👥"},
    {"value":"100+","label":"Hospitals","icon":"🏥"},
    {"value":"4.9","label":"Rating","icon":"⭐"}
]', 'JSON', 'HOME', 'Stats EN', 3)
ON CONFLICT (config_key) DO NOTHING;

-- HOME - CTA (English)
INSERT INTO system_configs (config_key, config_value, config_type, group_name, display_name, display_order) VALUES
                                                                                                                ('HOME_CTA_TITLE_EN', 'Ready to take care of your health?', 'TEXT', 'HOME', 'CTA Title EN', 4),
                                                                                                                ('HOME_CTA_SUBTITLE_EN', 'Book an appointment today for free consultation', 'TEXT', 'HOME', 'CTA Subtitle EN', 5),
                                                                                                                ('HOME_CTA_BUTTON_TEXT_EN', 'Register Now', 'TEXT', 'HOME', 'CTA Button Text EN', 6)
ON CONFLICT (config_key) DO NOTHING;