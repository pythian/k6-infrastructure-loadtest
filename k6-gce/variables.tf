variable "access_config" {
  type    = list(object({
    nat_ip       = optional(string)
    network_tier = optional(string)
  }))
  default = []
}

variable "bucket_name" {
  type    = string
}

variable "iap_users" {
  type = set(string)
}

variable "instance_name" {
  type = string
}

variable "machine_type" {
  type = string
}

variable "network" {
  type    = string
  default = "default"
}

variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "source_image" {
  type = string
}

variable "source_image_project" {
  type = string
}

variable "startup_script_path" {
  type    = string
  default = ""
}

variable "zone" {
  type = string
}
