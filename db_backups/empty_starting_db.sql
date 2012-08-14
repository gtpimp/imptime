-- MySQL dump 10.13  Distrib 5.5.24, for debian-linux-gnu (i686)
--
-- Host: localhost    Database: implicitdesign
-- ------------------------------------------------------
-- Server version	5.5.24-0ubuntu0.12.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`,`permission_id`),
  KEY `auth_group_permissions_425ae3c4` (`group_id`),
  KEY `auth_group_permissions_1e014c8f` (`permission_id`),
  CONSTRAINT `group_id_refs_id_3cea63fe` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `permission_id_refs_id_5886d21f` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_type_id` (`content_type_id`,`codename`),
  KEY `auth_permission_1bb8f392` (`content_type_id`),
  CONSTRAINT `content_type_id_refs_id_728de91f` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add permission',1,'add_permission'),(2,'Can change permission',1,'change_permission'),(3,'Can delete permission',1,'delete_permission'),(4,'Can add group',2,'add_group'),(5,'Can change group',2,'change_group'),(6,'Can delete group',2,'delete_group'),(7,'Can add user',3,'add_user'),(8,'Can change user',3,'change_user'),(9,'Can delete user',3,'delete_user'),(10,'Can add content type',4,'add_contenttype'),(11,'Can change content type',4,'change_contenttype'),(12,'Can delete content type',4,'delete_contenttype'),(13,'Can add session',5,'add_session'),(14,'Can change session',5,'change_session'),(15,'Can delete session',5,'delete_session'),(16,'Can add site',6,'add_site'),(17,'Can change site',6,'change_site'),(18,'Can delete site',6,'delete_site'),(19,'Can add attribute',7,'add_attribute'),(20,'Can change attribute',7,'change_attribute'),(21,'Can delete attribute',7,'delete_attribute'),(22,'Can add business',8,'add_business'),(23,'Can change business',8,'change_business'),(24,'Can delete business',8,'delete_business'),(25,'Can add project',9,'add_project'),(26,'Can change project',9,'change_project'),(27,'Can delete project',9,'delete_project'),(28,'Can view project',9,'view_project'),(29,'Can email project report',9,'email_project_report'),(30,'Can view project time sheet',9,'view_project_time_sheet'),(31,'Can export project time sheet',9,'export_project_time_sheet'),(32,'Can generate project invoice',9,'generate_project_invoice'),(33,'Can add relationship type',10,'add_relationshiptype'),(34,'Can change relationship type',10,'change_relationshiptype'),(35,'Can delete relationship type',10,'delete_relationshiptype'),(36,'Can add project relationship',11,'add_projectrelationship'),(37,'Can change project relationship',11,'change_projectrelationship'),(38,'Can delete project relationship',11,'delete_projectrelationship'),(39,'Can add activity',12,'add_activity'),(40,'Can change activity',12,'change_activity'),(41,'Can delete activity',12,'delete_activity'),(42,'Can add hour group',13,'add_hourgroup'),(43,'Can change hour group',13,'change_hourgroup'),(44,'Can delete hour group',13,'delete_hourgroup'),(45,'Can add activity group',14,'add_activitygroup'),(46,'Can change activity group',14,'change_activitygroup'),(47,'Can delete activity group',14,'delete_activitygroup'),(48,'Can add location',15,'add_location'),(49,'Can change location',15,'change_location'),(50,'Can delete location',15,'delete_location'),(51,'Can add entry',16,'add_entry'),(52,'Can change entry',16,'change_entry'),(53,'Can delete entry',16,'delete_entry'),(54,'Can use Pendulum to clock in',16,'can_clock_in'),(55,'Can pause and unpause log entries',16,'can_pause'),(56,'Can use Pendulum to clock out',16,'can_clock_out'),(57,'Can view entry summary page',16,'view_entry_summary'),(58,'Can view payroll summary page',16,'view_payroll_summary'),(59,'Can add entry group',17,'add_entrygroup'),(60,'Can change entry group',17,'change_entrygroup'),(61,'Can delete entry group',17,'delete_entrygroup'),(62,'Can add project contract',18,'add_projectcontract'),(63,'Can change project contract',18,'change_projectcontract'),(64,'Can delete project contract',18,'delete_projectcontract'),(65,'Can add contract milestone',19,'add_contractmilestone'),(66,'Can change contract milestone',19,'change_contractmilestone'),(67,'Can delete contract milestone',19,'delete_contractmilestone'),(68,'Can add contract assignment',20,'add_contractassignment'),(69,'Can change contract assignment',20,'change_contractassignment'),(70,'Can delete contract assignment',20,'delete_contractassignment'),(71,'Can add assignment allocation',21,'add_assignmentallocation'),(72,'Can change assignment allocation',21,'change_assignmentallocation'),(73,'Can delete assignment allocation',21,'delete_assignmentallocation'),(74,'Can add person schedule',22,'add_personschedule'),(75,'Can change person schedule',22,'change_personschedule'),(76,'Can delete person schedule',22,'delete_personschedule'),(77,'Can add user profile',23,'add_userprofile'),(78,'Can change user profile',23,'change_userprofile'),(79,'Can delete user profile',23,'delete_userprofile'),(80,'Can add project hours entry',24,'add_projecthours'),(81,'Can change project hours entry',24,'change_projecthours'),(82,'Can delete project hours entry',24,'delete_projecthours'),(83,'Can add migration history',25,'add_migrationhistory'),(84,'Can change migration history',25,'change_migrationhistory'),(85,'Can delete migration history',25,'delete_migrationhistory');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(75) NOT NULL,
  `password` varchar(128) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `last_login` datetime NOT NULL,
  `date_joined` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'gtp','','','gtp@implicitdesign.co.za','pbkdf2_sha256$10000$Rj8Zitv3IYKl$caznhqLeGk9tXOsldo1yP1WzP+yGzbIFwoXVqDi83EQ=',1,1,1,'2012-08-09 14:59:02','2012-08-09 14:59:02');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`group_id`),
  KEY `auth_user_groups_403f60f` (`user_id`),
  KEY `auth_user_groups_425ae3c4` (`group_id`),
  CONSTRAINT `user_id_refs_id_7ceef80f` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `group_id_refs_id_f116770` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`permission_id`),
  KEY `auth_user_user_permissions_403f60f` (`user_id`),
  KEY `auth_user_user_permissions_1e014c8f` (`permission_id`),
  CONSTRAINT `user_id_refs_id_dfbab7d` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `permission_id_refs_id_67e79cb` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_label` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'permission','auth','permission'),(2,'group','auth','group'),(3,'user','auth','user'),(4,'content type','contenttypes','contenttype'),(5,'session','sessions','session'),(6,'site','sites','site'),(7,'attribute','timepiece','attribute'),(8,'business','timepiece','business'),(9,'project','timepiece','project'),(10,'relationship type','timepiece','relationshiptype'),(11,'project relationship','timepiece','projectrelationship'),(12,'activity','timepiece','activity'),(13,'hour group','timepiece','hourgroup'),(14,'activity group','timepiece','activitygroup'),(15,'location','timepiece','location'),(16,'entry','timepiece','entry'),(17,'entry group','timepiece','entrygroup'),(18,'project contract','timepiece','projectcontract'),(19,'contract milestone','timepiece','contractmilestone'),(20,'contract assignment','timepiece','contractassignment'),(21,'assignment allocation','timepiece','assignmentallocation'),(22,'person schedule','timepiece','personschedule'),(23,'user profile','timepiece','userprofile'),(24,'project hours entry','timepiece','projecthours'),(25,'migration history','south','migrationhistory');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_3da3d3d8` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_site`
--

DROP TABLE IF EXISTS `django_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_site` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `domain` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_site`
--

LOCK TABLES `django_site` WRITE;
/*!40000 ALTER TABLE `django_site` DISABLE KEYS */;
INSERT INTO `django_site` VALUES (1,'example.com','example.com');
/*!40000 ALTER TABLE `django_site` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `south_migrationhistory`
--

DROP TABLE IF EXISTS `south_migrationhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `south_migrationhistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_name` varchar(255) NOT NULL,
  `migration` varchar(255) NOT NULL,
  `applied` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `south_migrationhistory`
--

LOCK TABLES `south_migrationhistory` WRITE;
/*!40000 ALTER TABLE `south_migrationhistory` DISABLE KEYS */;
INSERT INTO `south_migrationhistory` VALUES (1,'timepiece','0001_initial','2012-08-09 14:59:48'),(2,'timepiece','0002_auto__add_field_entry_billable','2012-08-09 14:59:48'),(3,'timepiece','0003_auto__add_field_projectcontract_status','2012-08-09 14:59:48'),(4,'timepiece','0004_auto__add_assignmentallocation','2012-08-09 14:59:48'),(5,'timepiece','0005_auto__add_field_contractassignment_min_hours_per_week','2012-08-09 14:59:48'),(6,'timepiece','0006_auto__add_field_projectrelationship_user','2012-08-09 14:59:48'),(7,'timepiece','0007_contact_user','2012-08-09 14:59:49'),(8,'timepiece','0008_auto__del_field_projectrelationship_user__chg_field_projectrelationshi','2012-08-09 14:59:49'),(9,'timepiece','0009_auto__chg_field_projectrelationship_contact__add_field_contractassignm','2012-08-09 14:59:49'),(10,'timepiece','0010_contact_user_asignment','2012-08-09 14:59:49'),(11,'timepiece','0011_auto__del_field_contractassignment_user__chg_field_contractassignment_','2012-08-09 14:59:49'),(12,'timepiece','0012_auto__chg_field_contractassignment_contact','2012-08-09 14:59:49'),(13,'timepiece','0013_auto__add_field_personrepeatperiod_user','2012-08-09 14:59:49'),(14,'timepiece','0014_contact_user_repeateperiod','2012-08-09 14:59:49'),(15,'timepiece','0015_auto__del_field_personrepeatperiod_user__chg_field_personrepeatperiod_','2012-08-09 14:59:49'),(16,'timepiece','0016_auto__add_field_personschedule_user','2012-08-09 14:59:49'),(17,'timepiece','0017_contact_user_schedule','2012-08-09 14:59:49'),(18,'timepiece','0018_auto__del_field_personschedule_user__chg_field_personschedule_contact','2012-08-09 14:59:49'),(19,'timepiece','0019_auto__add_relationshiptype','2012-08-09 14:59:49'),(20,'timepiece','0020_rename_related_tables','2012-08-09 14:59:49'),(21,'timepiece','0021_auto','2012-08-09 14:59:49'),(22,'timepiece','0022_import_rel_types','2012-08-09 14:59:49'),(23,'timepiece','0023_auto','2012-08-09 14:59:49'),(24,'timepiece','0024_remove_interactions','2012-08-09 14:59:49'),(25,'timepiece','0025_auto__add_business','2012-08-09 14:59:49'),(26,'timepiece','0026_auto__add_field_project_new_business','2012-08-09 14:59:49'),(27,'timepiece','0027_import_business','2012-08-09 14:59:49'),(28,'timepiece','0028_auto__chg_field_project_business','2012-08-09 14:59:49'),(29,'timepiece','0029_export_business','2012-08-09 14:59:49'),(30,'timepiece','0030_auto__del_field_project_business','2012-08-09 14:59:50'),(31,'timepiece','0031_auto__del_field_project_new_business__add_field_project_business','2012-08-09 14:59:50'),(32,'timepiece','0032_auto__chg_field_project_business','2012-08-09 14:59:50'),(33,'timepiece','0033_contact_to_user','2012-08-09 14:59:50'),(34,'timepiece','0034_auto__add_field_activity_billable__add_field_project_billable','2012-08-09 14:59:50'),(35,'timepiece','0035_billable_to_develop','2012-08-09 14:59:50'),(36,'timepiece','0036_auto__del_field_entry_billable','2012-08-09 14:59:50'),(37,'timepiece','0037_auto__chg_field_entry_activity','2012-08-09 14:59:50'),(38,'timepiece','0038_auto__del_field_project_billable','2012-08-09 14:59:50'),(39,'timepiece','0039_auto__add_field_entry_status','2012-08-09 14:59:50'),(40,'timepiece','0040_auto__add_field_attribute_billable','2012-08-09 14:59:50'),(41,'timepiece','0041_auto__add_userprofile','2012-08-09 14:59:50'),(42,'timepiece','0042_auto__del_field_userprofile_default_activity__chg_field_userprofile_us','2012-08-09 14:59:50'),(43,'timepiece','0043_auto__add_activitgroup','2012-08-09 14:59:50'),(44,'timepiece','0044_auto__add_field_project_activity_group','2012-08-09 14:59:50'),(45,'timepiece','0045_auto__add_entrygroup__add_field_entry_entry_group','2012-08-09 14:59:50'),(46,'timepiece','0046_auto__add_field_entrygroup_modified__chg_field_entrygroup_created','2012-08-09 14:59:50'),(47,'timepiece','0047_auto__add_contractmilestone','2012-08-09 14:59:50'),(48,'timepiece','0048_auto__add_hourgroup','2012-08-09 14:59:50'),(49,'timepiece','0049_auto__chg_field_entrygroup_number','2012-08-09 14:59:50'),(50,'timepiece','0050_auto','2012-08-09 14:59:51'),(51,'timepiece','0051_auto__del_field_project_billing_period','2012-08-09 14:59:51'),(52,'timepiece','0052_auto__del_repeatperiod__del_billingwindow__del_personrepeatperiod','2012-08-09 14:59:51'),(53,'timepiece','0053_drop_crm_tables','2012-08-09 14:59:51'),(54,'timepiece','0054_move_trac_environment_to_tracker_url','2012-08-09 14:59:51'),(55,'timepiece','0055_auto__chg_field_project_tracker_url','2012-08-09 14:59:51'),(56,'timepiece','0056_auto__add_projecthours','2012-08-09 14:59:51'),(57,'timepiece','0057_auto__add_unique_projecthours_project_week_start_user','2012-08-09 14:59:51'),(58,'timepiece','0058_auto__chg_field_entry_entry_group__add_field_projecthours_published','2012-08-09 14:59:51');
/*!40000 ALTER TABLE `south_migrationhistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_activity`
--

DROP TABLE IF EXISTS `timepiece_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(5) NOT NULL,
  `name` varchar(50) NOT NULL,
  `billable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_activity`
--

LOCK TABLES `timepiece_activity` WRITE;
/*!40000 ALTER TABLE `timepiece_activity` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_activitygroup`
--

DROP TABLE IF EXISTS `timepiece_activitygroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_activitygroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_activitygroup`
--

LOCK TABLES `timepiece_activitygroup` WRITE;
/*!40000 ALTER TABLE `timepiece_activitygroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_activitygroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_activitygroup_activities`
--

DROP TABLE IF EXISTS `timepiece_activitygroup_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_activitygroup_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activitygroup_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `activitygroup_id` (`activitygroup_id`,`activity_id`),
  KEY `timepiece_activitygroup_activities_7e119877` (`activitygroup_id`),
  KEY `timepiece_activitygroup_activities_45b57829` (`activity_id`),
  CONSTRAINT `activitygroup_id_refs_id_b68a268` FOREIGN KEY (`activitygroup_id`) REFERENCES `timepiece_activitygroup` (`id`),
  CONSTRAINT `activity_id_refs_id_65c5f93e` FOREIGN KEY (`activity_id`) REFERENCES `timepiece_activity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_activitygroup_activities`
--

LOCK TABLES `timepiece_activitygroup_activities` WRITE;
/*!40000 ALTER TABLE `timepiece_activitygroup_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_activitygroup_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_assignmentallocation`
--

DROP TABLE IF EXISTS `timepiece_assignmentallocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_assignmentallocation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `hours` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timepiece_assignmentallocation_482b57ab` (`assignment_id`),
  CONSTRAINT `assignment_id_refs_id_2a9b41a3` FOREIGN KEY (`assignment_id`) REFERENCES `timepiece_contractassignment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_assignmentallocation`
--

LOCK TABLES `timepiece_assignmentallocation` WRITE;
/*!40000 ALTER TABLE `timepiece_assignmentallocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_assignmentallocation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_attribute`
--

DROP TABLE IF EXISTS `timepiece_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_attribute` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(32) NOT NULL,
  `label` varchar(255) NOT NULL,
  `sort_order` smallint(6) DEFAULT NULL,
  `enable_timetracking` tinyint(1) NOT NULL,
  `billable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`,`label`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_attribute`
--

LOCK TABLES `timepiece_attribute` WRITE;
/*!40000 ALTER TABLE `timepiece_attribute` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_business`
--

DROP TABLE IF EXISTS `timepiece_business`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_business` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `email` varchar(75) NOT NULL,
  `description` longtext NOT NULL,
  `notes` longtext NOT NULL,
  `external_id` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_business`
--

LOCK TABLES `timepiece_business` WRITE;
/*!40000 ALTER TABLE `timepiece_business` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_business` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_contractassignment`
--

DROP TABLE IF EXISTS `timepiece_contractassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_contractassignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contract_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `num_hours` decimal(8,2) NOT NULL,
  `min_hours_per_week` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contract_id` (`contract_id`,`user_id`),
  KEY `timepiece_contractassignment_4f844952` (`contract_id`),
  KEY `timepiece_contractassignment_403f60f` (`user_id`),
  CONSTRAINT `user_id_refs_id_282eb0f` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `contract_id_refs_id_67e44d0e` FOREIGN KEY (`contract_id`) REFERENCES `timepiece_projectcontract` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_contractassignment`
--

LOCK TABLES `timepiece_contractassignment` WRITE;
/*!40000 ALTER TABLE `timepiece_contractassignment` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_contractassignment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_contractmilestone`
--

DROP TABLE IF EXISTS `timepiece_contractmilestone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_contractmilestone` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contract_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `hours` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timepiece_contractmilestone_4f844952` (`contract_id`),
  CONSTRAINT `contract_id_refs_id_7e06508` FOREIGN KEY (`contract_id`) REFERENCES `timepiece_projectcontract` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_contractmilestone`
--

LOCK TABLES `timepiece_contractmilestone` WRITE;
/*!40000 ALTER TABLE `timepiece_contractmilestone` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_contractmilestone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_entry`
--

DROP TABLE IF EXISTS `timepiece_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_entry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `entry_group_id` int(11) DEFAULT NULL,
  `status` varchar(24) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `seconds_paused` int(10) unsigned NOT NULL,
  `pause_time` datetime DEFAULT NULL,
  `comments` longtext NOT NULL,
  `date_updated` datetime NOT NULL,
  `hours` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timepiece_entry_403f60f` (`user_id`),
  KEY `timepiece_entry_499df97c` (`project_id`),
  KEY `timepiece_entry_45b57829` (`activity_id`),
  KEY `timepiece_entry_319d859` (`location_id`),
  KEY `timepiece_entry_2daa1e7d` (`entry_group_id`),
  KEY `timepiece_entry_801e862` (`end_time`),
  CONSTRAINT `entry_group_id_refs_id_48ab638b` FOREIGN KEY (`entry_group_id`) REFERENCES `timepiece_entrygroup` (`id`),
  CONSTRAINT `activity_id_refs_id_6dcf97e9` FOREIGN KEY (`activity_id`) REFERENCES `timepiece_activity` (`id`),
  CONSTRAINT `location_id_refs_id_1f519445` FOREIGN KEY (`location_id`) REFERENCES `timepiece_location` (`id`),
  CONSTRAINT `project_id_refs_id_3733f42a` FOREIGN KEY (`project_id`) REFERENCES `timepiece_project` (`id`),
  CONSTRAINT `user_id_refs_id_669dbd` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_entry`
--

LOCK TABLES `timepiece_entry` WRITE;
/*!40000 ALTER TABLE `timepiece_entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_entrygroup`
--

DROP TABLE IF EXISTS `timepiece_entrygroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_entrygroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `status` varchar(24) NOT NULL,
  `number` varchar(50) DEFAULT NULL,
  `comments` longtext,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  `start` date DEFAULT NULL,
  `end` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timepiece_entrygroup_403f60f` (`user_id`),
  KEY `timepiece_entrygroup_499df97c` (`project_id`),
  CONSTRAINT `project_id_refs_id_544fb1f0` FOREIGN KEY (`project_id`) REFERENCES `timepiece_project` (`id`),
  CONSTRAINT `user_id_refs_id_1e8cb85d` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_entrygroup`
--

LOCK TABLES `timepiece_entrygroup` WRITE;
/*!40000 ALTER TABLE `timepiece_entrygroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_entrygroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_hourgroup`
--

DROP TABLE IF EXISTS `timepiece_hourgroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_hourgroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `order` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_hourgroup`
--

LOCK TABLES `timepiece_hourgroup` WRITE;
/*!40000 ALTER TABLE `timepiece_hourgroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_hourgroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_hourgroup_activities`
--

DROP TABLE IF EXISTS `timepiece_hourgroup_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_hourgroup_activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hourgroup_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hourgroup_id` (`hourgroup_id`,`activity_id`),
  KEY `timepiece_hourgroup_activities_41ecb11e` (`hourgroup_id`),
  KEY `timepiece_hourgroup_activities_45b57829` (`activity_id`),
  CONSTRAINT `hourgroup_id_refs_id_4a57b328` FOREIGN KEY (`hourgroup_id`) REFERENCES `timepiece_hourgroup` (`id`),
  CONSTRAINT `activity_id_refs_id_701591bf` FOREIGN KEY (`activity_id`) REFERENCES `timepiece_activity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_hourgroup_activities`
--

LOCK TABLES `timepiece_hourgroup_activities` WRITE;
/*!40000 ALTER TABLE `timepiece_hourgroup_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_hourgroup_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_location`
--

DROP TABLE IF EXISTS `timepiece_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_location`
--

LOCK TABLES `timepiece_location` WRITE;
/*!40000 ALTER TABLE `timepiece_location` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_personschedule`
--

DROP TABLE IF EXISTS `timepiece_personschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_personschedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `hours_per_week` decimal(8,2) NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_id_refs_id_7cbcf362` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_personschedule`
--

LOCK TABLES `timepiece_personschedule` WRITE;
/*!40000 ALTER TABLE `timepiece_personschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_personschedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_project`
--

DROP TABLE IF EXISTS `timepiece_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `tracker_url` varchar(255) NOT NULL,
  `business_id` int(11) NOT NULL,
  `point_person_id` int(11) NOT NULL,
  `activity_group_id` int(11) DEFAULT NULL,
  `type_id` int(11) NOT NULL,
  `status_id` int(11) NOT NULL,
  `description` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timepiece_project_4df04126` (`business_id`),
  KEY `timepiece_project_60d6e8da` (`point_person_id`),
  KEY `timepiece_project_51caf02f` (`activity_group_id`),
  KEY `timepiece_project_777d41c8` (`type_id`),
  KEY `timepiece_project_44224078` (`status_id`),
  CONSTRAINT `activity_group_id_refs_id_5b17020c` FOREIGN KEY (`activity_group_id`) REFERENCES `timepiece_activitygroup` (`id`),
  CONSTRAINT `business_id_refs_id_5e01ffa5` FOREIGN KEY (`business_id`) REFERENCES `timepiece_business` (`id`),
  CONSTRAINT `point_person_id_refs_id_28ee38c0` FOREIGN KEY (`point_person_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `status_id_refs_id_23e9d498` FOREIGN KEY (`status_id`) REFERENCES `timepiece_attribute` (`id`),
  CONSTRAINT `type_id_refs_id_23e9d498` FOREIGN KEY (`type_id`) REFERENCES `timepiece_attribute` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_project`
--

LOCK TABLES `timepiece_project` WRITE;
/*!40000 ALTER TABLE `timepiece_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_projectcontract`
--

DROP TABLE IF EXISTS `timepiece_projectcontract`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_projectcontract` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `num_hours` decimal(8,2) NOT NULL,
  `status` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `timepiece_projectcontract_499df97c` (`project_id`),
  CONSTRAINT `project_id_refs_id_1873bf33` FOREIGN KEY (`project_id`) REFERENCES `timepiece_project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_projectcontract`
--

LOCK TABLES `timepiece_projectcontract` WRITE;
/*!40000 ALTER TABLE `timepiece_projectcontract` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_projectcontract` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_projecthours`
--

DROP TABLE IF EXISTS `timepiece_projecthours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_projecthours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `week_start` date NOT NULL,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hours` decimal(8,2) NOT NULL,
  `published` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `week_start` (`week_start`,`project_id`,`user_id`),
  KEY `timepiece_projecthours_499df97c` (`project_id`),
  KEY `timepiece_projecthours_403f60f` (`user_id`),
  CONSTRAINT `project_id_refs_id_61900875` FOREIGN KEY (`project_id`) REFERENCES `timepiece_project` (`id`),
  CONSTRAINT `user_id_refs_id_3c9515a8` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_projecthours`
--

LOCK TABLES `timepiece_projecthours` WRITE;
/*!40000 ALTER TABLE `timepiece_projecthours` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_projecthours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_projectrelationship`
--

DROP TABLE IF EXISTS `timepiece_projectrelationship`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_projectrelationship` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`project_id`),
  KEY `timepiece_projectrelationship_403f60f` (`user_id`),
  KEY `timepiece_projectrelationship_499df97c` (`project_id`),
  CONSTRAINT `project_id_refs_id_51379b5d` FOREIGN KEY (`project_id`) REFERENCES `timepiece_project` (`id`),
  CONSTRAINT `user_id_refs_id_3cff6e36` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_projectrelationship`
--

LOCK TABLES `timepiece_projectrelationship` WRITE;
/*!40000 ALTER TABLE `timepiece_projectrelationship` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_projectrelationship` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_projectrelationship_types`
--

DROP TABLE IF EXISTS `timepiece_projectrelationship_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_projectrelationship_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `projectrelationship_id` int(11) NOT NULL,
  `relationshiptype_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projectrelationship_id` (`projectrelationship_id`,`relationshiptype_id`),
  KEY `timepiece_projectrelationship_types_21c0f2fa` (`projectrelationship_id`),
  KEY `timepiece_projectrelationship_types_17703272` (`relationshiptype_id`),
  CONSTRAINT `projectrelationship_id_refs_id_8c673f5` FOREIGN KEY (`projectrelationship_id`) REFERENCES `timepiece_projectrelationship` (`id`),
  CONSTRAINT `relationshiptype_id_refs_id_176269b7` FOREIGN KEY (`relationshiptype_id`) REFERENCES `timepiece_relationshiptype` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_projectrelationship_types`
--

LOCK TABLES `timepiece_projectrelationship_types` WRITE;
/*!40000 ALTER TABLE `timepiece_projectrelationship_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_projectrelationship_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_relationshiptype`
--

DROP TABLE IF EXISTS `timepiece_relationshiptype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_relationshiptype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_relationshiptype`
--

LOCK TABLES `timepiece_relationshiptype` WRITE;
/*!40000 ALTER TABLE `timepiece_relationshiptype` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_relationshiptype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timepiece_userprofile`
--

DROP TABLE IF EXISTS `timepiece_userprofile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timepiece_userprofile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_id_refs_id_371e6ecf` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timepiece_userprofile`
--

LOCK TABLES `timepiece_userprofile` WRITE;
/*!40000 ALTER TABLE `timepiece_userprofile` DISABLE KEYS */;
/*!40000 ALTER TABLE `timepiece_userprofile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-08-09 17:00:22
