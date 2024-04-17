terraform {
  backend "gcs" {
    bucket = "pythian_terraform"
    prefix = "pythian_k6_gce"
  }
}

locals {
  iap_role          = "roles/iap.tunnelResourceAccessor"
  iap_source_ranges = ["35.235.240.0/20"]
}

terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = "5.25.0"
    }
    google-beta = {
      source = "hashicorp/google-beta"
      version = "5.25.0"
    }
  }
}

provider "google" {
}

provider "google-beta" {
}

# Service account for GCE instance

resource "google_service_account" "account" {
  account_id = "${var.project}-${var.instance_name}"
  project    = var.project
}

module "bucket" {
  source  = "terraform-google-modules/cloud-storage/google//modules/simple_bucket"
  version = "~> 5.0.0"

  name       = var.bucket_name
  project_id = var.project
  location   = var.region
  iam_members = [{
    role   = "roles/storage.objectViewer"
    member = format("serviceAccount:%s", google_service_account.account.email)
  }]
}

module "template" {
  source  = "terraform-google-modules/vm/google//modules/instance_template"
  version = "~> 11.0"

  network              = var.network
  machine_type         = var.machine_type
  project_id           = var.project
  region               = var.region
  startup_script       = var.startup_script_path != "" ? file(var.startup_script_path) : null
  source_image         = var.source_image
  source_image_project = var.source_image_project

  service_account = {
    email  = google_service_account.account.email
    scopes = ["cloud-platform"]
  }
}

module "instance" {
  source  = "terraform-google-modules/vm/google//modules/compute_instance"
  version = "~> 11.0"

  access_config       = var.access_config
  deletion_protection = false
  hostname            = "${var.project}-${var.instance_name}"
  instance_template   = module.template.self_link
  network             = var.network
  region              = var.region
  zone                = var.zone
}

# IAP Setup

resource "google_compute_firewall" "iap" {
  project       = var.project
  name          = "allow-ssh-from-iap"
  network       = var.network
  source_ranges = local.iap_source_ranges

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}

resource "google_iap_tunnel_instance_iam_member" "iap" {
  provider = google-beta
  for_each = var.iap_users

  instance = element(split("/", module.instance.instances_self_links[0]), length(split("/", module.instance.instances_self_links[0]))-1)
  member   = "user:${each.key}"
  project  = var.project
  role     = local.iap_role
  zone     = element(regex("zones/(.*)/instances", module.instance.instances_self_links[0]), 0)
}
