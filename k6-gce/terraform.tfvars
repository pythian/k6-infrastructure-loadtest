access_config        = [{network_tier = "STANDARD"}]
bucket_name          = "pythian-k6-scenario-data"
iap_users            = ["username@pythian.com", "username2@pythian.com"]
instance_name        = "k6"
machine_type         = "n2-standard-2"
project              = "k6-pythian"
region               = "southamerica-east1"
source_image         = "ubuntu-2204-jammy-v20240307"
source_image_project = "ubuntu-os-cloud"
startup_script_path  = "startup.sh"
zone                 = "southamerica-east1-a"
