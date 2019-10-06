DROP TABLE t_usergroup_member CASCADE;
DROP TABLE t_authorization CASCADE;
DROP TABLE t_permission CASCADE;
DROP TABLE t_permissiongroup CASCADE;
DROP TABLE t_transaction CASCADE;
DROP TABLE t_reservation CASCADE;
DROP TABLE t_timeslot CASCADE;
DROP TABLE t_court CASCADE;
DROP TABLE t_location CASCADE;
DROP TABLE t_log CASCADE;
DROP TABLE t_usergroup CASCADE;
DROP TABLE t_user CASCADE;
DROP TABLE t_club CASCADE;
DROP TABLE t_currency CASCADE;
DROP TABLE t_contact CASCADE;
DROP TABLE t_city CASCADE;
DROP TABLE t_country CASCADE;
DROP TABLE t_newsletter CASCADE;
DROP TABLE t_newsletter_receiver CASCADE;

CREATE TABLE t_country (
	cou_id 			    serial 		PRIMARY KEY,
	cou_code            VARCHAR(3)	NOT NULL,
	cou_localized_de	VARCHAR 	NOT NULL
);

CREATE TABLE t_city (
	cit_id 			serial 			PRIMARY KEY,
	cit_zip			VARCHAR			NOT NULL,
	cit_name		VARCHAR			NOT NULL,
	cit_country		INTEGER			--NOT NULL --CONSTRAINT ref_country REFERENCES t_country(cou_id) MATCH FULL ON DELETE CASCADE
);

CREATE TABLE t_contact (
	con_id 			serial 			PRIMARY KEY,
	con_street		VARCHAR		 	NOT NULL DEFAULT '',
	con_street2 	VARCHAR			NOT NULL DEFAULT '',
	con_city		INTEGER			DEFAULT NULL, --CONSTRAINT ref_city REFERENCES t_city(cit_id) MATCH FULL ON DELETE SET NULL,
	con_phone		VARCHAR			NOT NULL DEFAULT '',
	con_fax			VARCHAR			NOT NULL DEFAULT '',
	con_email		VARCHAR			NOT NULL DEFAULT '',
	con_url			VARCHAR			NOT NULL DEFAULT ''
);

CREATE TABLE t_currency (
	cur_id 			serial 			PRIMARY KEY,
	cur_name 		VARCHAR 		NOT NULL,
    cur_code		VARCHAR(3) 		UNIQUE NOT NULL,
    cur_eurvalue	numeric(10,2)
);

CREATE TABLE t_club (
	clb_id 			serial 			PRIMARY KEY,
	clb_name 		VARCHAR			NOT NULL,
    clb_alias       VARCHAR         UNIQUE NOT NULL,
	clb_contact		INTEGER			DEFAULT NULL, --CONSTRAINT ref_contact REFERENCES t_contact(con_id) MATCH FULL ON DELETE SET NULL,
	clb_active		BOOLEAN			NOT NULL DEFAULT true,
    clb_currency    INTEGER			,--NOT NULL, --CONSTRAINT ref_currency REFERENCES	t_currency(cur_id) MATCH FULL, -- ON DELETE ?!
	clb_timezone 	VARCHAR			NOT NULL DEFAULT 'Europe/Vienna', 
	clb_showuserinfo      BOOLEAN	   NOT NULL DEFAULT true,		-- Show Userinfo in Frontend
    clb_cancelationperiod INTEGER      NOT NULL DEFAULT 0,
    clb_reservationperiod INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE t_user (
    usr_id			serial			PRIMARY KEY,
    usr_createtime  TIMESTAMP WITH TIME ZONE NOT NULL,
    usr_username	VARCHAR			NOT NULL,
    usr_password	VARCHAR			NOT NULL,
    usr_firstname	VARCHAR			NOT NULL DEFAULT '',
    usr_lastname	VARCHAR			NOT NULL DEFAULT '',
    usr_title		VARCHAR			NOT NULL DEFAULT '',
    usr_company		VARCHAR			NOT NULL DEFAULT '',
    usr_iscompany	BOOLEAN			NOT NULL DEFAULT false,
    usr_isprepaid	BOOLEAN			NOT NULL DEFAULT true,
    usr_club		INTEGER  	    DEFAULT NULL, --CONSTRAINT ref_club 	 REFERENCES t_club(clb_id) MATCH FULL ON DELETE CASCADE,
    usr_contact		INTEGER			DEFAULT NULL, --CONSTRAINT	ref_contanct REFERENCES t_contact(con_id) MATCH FULL ON DELETE SET NULL,
    usr_permissiongroup  INTEGER    DEFAULT NULL,
    usr_active		BOOLEAN			NOT NULL DEFAULT true,
    usr_lastlogin	TIMESTAMP WITH TIME ZONE,
    UNIQUE(usr_username, usr_club)
);

CREATE TABLE t_usergroup (
	ugp_id 			serial 			PRIMARY KEY,
	ugp_name 		VARCHAR			NOT NULL,
	ugp_description	VARCHAR			NOT NULL DEFAULT '',
	ugp_club 		INTEGER			,--NOT NULL, --CONSTRAINT ref_club REFERENCES t_club(clb_id) MATCH FULL ON DELETE CASCADE,
	ugp_discount	NUMERIC(5,4)	NOT NULL DEFAULT 0.0,
	UNIQUE(ugp_name, ugp_club)
);

CREATE TABLE t_usergroup_member (
	ugm_id  		serial 			PRIMARY KEY,
	ugm_user 		INTEGER			,--NOT NULL,-- CONSTRAINT ref_user REFERENCES t_user(usr_id) MATCH FULL ON DELETE CASCADE,
	ugm_usergroup   INTEGER			,--NOT NULL,-- CONSTRAINT	ref_usergroup REFERENCES t_usergroup(ugp_id) MATCH FULL ON DELETE CASCADE,
	UNIQUE(ugm_user, ugm_usergroup)
);

CREATE TABLE t_log (
	log_id 			serial 			PRIMARY KEY,
	log_date		TIMESTAMP WITH TIME ZONE NOT NULL,
	log_club		INTEGER,			--CONSTRAINT ref_club REFERENCES t_club(clb_id) MATCH FULL ON DELETE CASCADE,
	log_user        INTEGER,			--CONSTRAINT ref_user REFERENCES t_user(usr_id) MATCH FULL ON DELETE CASCADE,
	log_ip			VARCHAR			NOT NULL,
	log_accesspoint VARCHAR 		NOT NULL,
	log_action		VARCHAR 		NOT NULL,
	log_value 		VARCHAR
);

CREATE TABLE t_location (
	loc_id 			serial 			PRIMARY KEY,
	loc_club		INTEGER			, --NOT NULL,-- CONSTRAINT ref_club REFERENCES t_club(clb_id) MATCH FULL ON DELETE CASCADE,
	loc_name 		VARCHAR 		NOT NULL,
	loc_alias		VARCHAR			NOT NULL,
	loc_description VARCHAR			NOT NULL DEFAULT '',
	loc_contact		INTEGER			DEFAULT NULL,-- CONSTRAINT ref_contanct REFERENCES t_contact(con_id) MATCH FULL ON DELETE SET NULL,
	loc_sortorder	INTEGER			NOT NULL DEFAULT 0,
	loc_active		BOOLEAN			NOT NULL DEFAULT true,
    UNIQUE(loc_alias, loc_club)
);

CREATE TABLE t_court (
	cou_id 			serial 			PRIMARY KEY,
	cou_location 	INTEGER			, --NOT NULL,-- CONSTRAINT ref_location REFERENCES	t_location(loc_id) MATCH FULL ON DELETE CASCADE,
	cou_name 		VARCHAR 		NOT NULL,
	cou_alias       VARCHAR         NOT NULL,
	cou_description VARCHAR			NOT NULL DEFAULT '',
	cou_sortorder	INTEGER			NOT NULL DEFAULT 0,
	cou_active		BOOLEAN			NOT NULL DEFAULT true,
	UNIQUE(cou_alias, cou_location)
);

CREATE TABLE t_timeslot (
	tsl_id 			serial 			PRIMARY KEY,
	tsl_court		INTEGER			, --NOT NULL,-- CONSTRAINT ref_court REFERENCES t_court(cou_id) MATCH FULL ON DELETE CASCADE,
	tsl_timestart	TIME			NOT NULL,
	tsl_timeend 	TIME 			NOT NULL,
	tsl_slotsize	INTEGER			NOT NULL DEFAULT 60,
	tsl_periodstart TIMESTAMP WITH TIME ZONE	 NOT NULL,
	tsl_periodend   TIMESTAMP WITH TIME ZONE	 DEFAULT NULL,
	tsl_daymask	    VARCHAR			NOT NULL DEFAULT '1111111', -- beginning with Monday! BIT (7)
	tsl_price		NUMERIC(10,2)
);

CREATE TABLE t_reservation (
	res_id          serial 			PRIMARY KEY,
	res_user        INTEGER		 	, --NOT NULL,-- CONSTRAINT ref_user REFERENCES t_user(usr_id) MATCH FULL ON DELETE CASCADE,
	res_timeslot    INTEGER			,--CONSTRAINT ref_timeslot REFERENCES t_timeslot(tsl_id) MATCH FULL ON DELETE SET NULL,
	res_date        TIMESTAMP WITH TIME ZONE NOT NULL,
	res_timestart	TIMESTAMP WITH TIME ZONE	NOT NULL,
	res_timeend     TIMESTAMP WITH TIME ZONE 	NOT NULL,
    res_transaction INTEGER
);

CREATE TABLE t_transaction (
    tra_id 			serial 			PRIMARY KEY,
    tra_user		INTEGER		    , --NOT NULL,-- CONSTRAINT ref_user REFERENCES t_user(usr_id) MATCH FULL ON DELETE CASCADE,
	tra_date    	TIMESTAMP WITH TIME ZONE 	NOT NULL,
	tra_grossvalue	NUMERIC(10,2)	NOT NULL,
	tra_discount 	NUMERIC(5,4)	NOT NULL DEFAULT 0.0,
	tra_price		NUMERIC(10,2)	NOT NULL,
	tra_action 		VARCHAR 		NOT NULL,
	tra_reservation INTEGER			--CONSTRAINT ref_reservation REFERENCES t_reservation(res_id) MATCH FULL ON DELETE SET NULL
);

CREATE TABLE t_permissiongroup (
	pmg_id 			serial 			PRIMARY KEY,
	pmg_name 		VARCHAR			UNIQUE  NOT NULL
);

CREATE TABLE t_permission (
	per_id 			serial 			PRIMARY KEY,
	per_name 		VARCHAR 		UNIQUE NOT NULL
);

CREATE TABLE t_authorization (
	aut_id 			serial 			PRIMARY KEY,
	aut_permissiongroup INTEGER		, --NOT NULL,-- CONSTRAINT ref_permissiongroup REFERENCES t_permissiongroup(pmg_id) MATCH FULL ON DELETE CASCADE,
	aut_permission 	INTEGER			, --NOT NULL,-- CONSTRAINT ref_permission 	    REFERENCES t_permission(per_id) MATCH FULL ON DELETE CASCADE,
	UNIQUE (aut_permissiongroup, aut_permission)
);

CREATE TABLE t_newsletter (
	nlt_id			serial			PRIMARY KEY,
	nlt_club		INTEGER			, --NOT NULL,-- CONSTRAINT ref_club REFERENCES t_club(clb_id) MATCH FULL ON DELETE CASCADE,
	nlt_user		INTEGER			, --NOT NULL,-- CONSTRAINT ref_user REFERENCES t_user(usr_id) MATCH FULL ON DELETE CASCADE,
	nlt_date		TIMESTAMP WITH TIME ZONE NOT NULL,
	nlt_subject	   	VARCHAR			NOT NULL DEFAULT '',
	nlt_body		VARCHAR			NOT NULL DEFAULT ''
);

CREATE TABLE t_newsletter_receiver (
	nlr_id			serial			PRIMARY KEY,
	nlr_newsletter	INTEGER			, --NOT NULL,-- CONSTRAINT ref_newsletter REFERENCES t_newsletter(nlt_id) MATCH FULL ON DELETE CASCADE,
	nlr_user		INTEGER			, --NOT NULL,-- CONSTRAINT ref_user REFERENCES t_user(usr_id) MATCH FULL ON DELETE CASCADE,
	UNIQUE(nlr_newsletter, nlr_user)
);