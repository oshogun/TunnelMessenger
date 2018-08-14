
# Folders
CSS             :=css
JS              :=js
LIB             :=lib
TS              :=scripts
USER_IMAGES     :=user_images
LANGFOLDER      :=languages
TESTS           :=$(TS)/tests
DEFS            :=$(TS)/defs
BACKENDFOLDER   :=backend
FRONTENDFOLDER  :=frontend
SHAREDFOLDER    :=shared
BACKENDJS       :=$(JS)/$(BACKENDFOLDER)
FRONTENDJS      :=$(JS)/$(FRONTENDFOLDER)
SHAREDJS        :=$(JS)/$(SHAREDFOLDER)
BACKENDTS       :=$(TS)/$(BACKENDFOLDER)
FRONTENDTS      :=$(TS)/$(FRONTENDFOLDER)
SHAREDTS        :=$(TS)/$(SHAREDFOLDER)
PACKAGES        :=$(BACKENDTS)/packages

# Special files
INDEX           :=index.html
DEFSFILE        :=defs.txt
LIBSFILE        :=libs.txt
PACKAGELIST     :=$(BACKENDTS)/PackageIndex.ts
PRIORITYFILE    :=priority.txt
BACKENDFOLDER   :=$(JS)/backend/
BACKENDMAIN     :=app.js
JSBASE          :=$(JS)/base.js
FRONTENDMAIN    :=$(JS)/frontend/main.js
JSTESTS         :=tests.js

COMPRESS        :=0

SHAREDFILES     :=$(shell find $(SHAREDTS) -mindepth 1 -name "*.ts")
BACKENDFILES    :=$(shell find $(BACKENDTS) -mindepth 1 -name "*.ts")
FRONTENDFILES   :=$(shell find $(FRONTENDTS) -mindepth 1 -name "*.ts")
PACKAGEFILES    :=$(basename $(notdir $(wildcard $(PACKAGES)/*.ts)))
TSTESTFILES     :=$(wildcard $(TESTS)/*.ts)
ORIGDEFNAMES    :=$(shell cat $(DEFSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
ORIGLIBNAMES    :=$(shell cat $(LIBSFILE) | sed "s/^\([^:]\+\): \(.*\)/\1/")
DEFNAMES        :=$(patsubst %, $(DEFS)/%, $(ORIGDEFNAMES))
LIBNAMES        :=$(patsubst %, $(LIB)/%, $(ORIGLIBNAMES))

BACKENDFILES += $(SHAREDFILES)
FRONTENDFILES += $(SHAREDFILES)

.PHONY: all install run tests dirs libs languages raw clean clean_all

all: dirs defs libs languages $(BACKENDMAIN) $(FRONTENDMAIN)

$(BACKENDMAIN): $(BACKENDFILES) $(PACKAGELIST)
	@echo "[ backend ]"
	@echo "[.ts ⟶ .js] translating backend scripts"
	@if [ "$(BACKENDFILES)" != "" ]; then \
		tsc --strictNullChecks --removeComments --noImplicitReturns --outDir $(JS) $(BACKENDFILES); \
	fi

	@echo "[  alias  ] $(BACKENDFOLDER)$(BACKENDMAIN) ⟶ $(BACKENDMAIN)"
	@rm -f $(BACKENDMAIN)
	@ln -s $(BACKENDFOLDER)/$(BACKENDMAIN) $(BACKENDMAIN)

$(FRONTENDMAIN): $(FRONTENDFILES)
	@echo "[front end]"
	@mkdir -p $(JS)/frontend
	@touch $(JSBASE)
	@truncate -s 0 $(JSBASE)

	@echo "[.ts ⟶ .js] translating frontend scripts"
	@if [ "$(FRONTENDFILES)" != "" ]; then \
		tsc --strictNullChecks --removeComments --noImplicitReturns --module amd --outFile $(JSBASE) $(FRONTENDFILES); \
	fi

	@if [ "$(COMPRESS)" = "1" ]; then \
		echo "[minifying] $(JSBASE) ⟶ $(FRONTENDMAIN)"; \
		uglifyjs $(JSBASE) --compress --mangle > $(FRONTENDMAIN) 2> /dev/null; \
	else\
		echo "[ copying ] $(JSBASE) ⟶ $(FRONTENDMAIN)"; \
		cp $(JSBASE) $(FRONTENDMAIN); \
	fi

	@rm $(JSBASE)

install:
	@npm install

run:
	@node $(BACKENDMAIN)

tests: all
	@cp $(JS)/$(JSCOMPRESSED) $(JS)/$(JSTESTS)

dirs: | $(CSS) $(JS) $(LIB) $(TS) $(USER_IMAGES)

defs: | $(DEFNAMES)

libs: | $(LIBNAMES)

raw: COMPRESS :=0
raw: all

$(CSS) $(JS) $(LIB) $(TS) $(TS)/defs $(USER_IMAGES):
	@echo "[  mkdir  ] $@"
	@mkdir -p $@

$(LIBNAMES):
	$(eval PURENAME=$(patsubst $(LIB)/%, %, $@))
	$(eval URL=$(shell cat $(LIBSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@#" # syntax highlight fix
	@echo "[   lib   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)

$(DEFNAMES): | $(TS)/defs
	$(eval PURENAME=$(patsubst $(DEFS)/%, %, $@))
	$(eval URL=$(shell cat $(DEFSFILE) | grep "^$(PURENAME):" | sed "s/^\([^:]\+\): \(.*\)/\2/"))
	@#" # syntax highlight fix
	@echo "[   def   ] $(PURENAME)"
	@touch $@
	@wget -O $@ -q $(URL)

$(PACKAGELIST): $(PACKAGES)
	@echo "[aux files] Building auxiliary files"
	@truncate -s 0 $(PACKAGELIST)

	@touch temp

	@printf "export let packageIndex = {\n" >> temp
	@for name in $(PACKAGEFILES); do \
		printf "import {$$name} from \"./packages/$$name\"\n" >> $(PACKAGELIST); \
		printf "\t\"$$name\": $$name,\n" >> temp; \
	done
	@printf "}\n" >> temp
	@cat temp >> $(PACKAGELIST)
	@rm temp

clean:
	@rm -rf js/*
	@rm -f $(BACKENDMAIN)
	@rm -rf $(USER_IMAGES)/*

clean_all: clean
	@rm -rf $(DEFS)/*
	@rm -rf node_modules
