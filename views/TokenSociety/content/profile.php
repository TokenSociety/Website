<div id="content" class="<?php echo $self ? "self" : ""; ?>">
    <!-- Outer container -->
    <div class="layout-container">

        <!-- banner container -->
        <div class="banner-container">
            <div class="banner-block" style="background-image: url(<?php echo $coverUrl ?>)">
                <button class="Q_button" name="coverPhoto"><?php echo $params["me"]["UploadCoverPhoto"] ?></button>
            </div>
            <?php echo Q::tool("Users/avatar", array(
                'userId' => $user->id,
                'editable' => $self,
                "icon" => $isMobile ? 80 : 200
            ), "profile-avatar")?>
        </div>

        <!-- Social icons, quick links -->
        <ul class="header-list-itms">
            <li>
                <div class="Communities_profile" data-val="social">
                    <h2><?php echo $profile['MySocial']; ?></h2>
                    <?php
					$facebook = Q::ifset($xids, 'facebook/'.$app, null);
                    if ($self || $facebook) {
                        echo '<i class="Communities_social_icon" data-type="facebook" data-connected="'.$facebook.'"></i>';
                    }

                    $twitter = Q::ifset($xids, 'twitter/'.$app, null);
                    if ($self || $twitter) {
                        echo '<i class="Communities_social_icon" data-type="twitter" data-connected="'.$twitter.'"></i>';
                    }

                    $linkedin = Q::ifset($xids, 'linkedin/'.$app, null);
                    if ($self || $linkedin) {
                        echo '<i class="Communities_social_icon" data-type="linkedin" data-connected="'.$linkedin.'"></i>';
                    }

                    $github = Q::ifset($xids, 'github/'.$app, null);
                    if ($self || $github) {
                        echo '<i class="Communities_social_icon" data-type="github" data-connected="'.$github.'"></i>';
                    }

                    $instagram = Q::ifset($xids, 'instagram/'.$app, null);
                    if ($self || $instagram) {
                        echo '<i class="Communities_social_icon" data-type="instagram" data-connected="'.$instagram.'"></i>';
                    }
                    ?>
                </div>
            </li>
            <li class="followers <?php echo ($followers["res"] ? "Q_selected" : "") ?>"><?php echo $params["Followers"] ?> <span><?php echo $followers["followers"]?></span></li>
            <li class="follow"><a href="#" class="follow-btn"><?php echo $params["Follow"] ?></a></li>
            <li class="following"><?php echo $params["Following"] ?> <span><?php echo $following ?></span></li>
        </ul>
        <div class="profile-block">
            <div class="profile-name">
            <?php echo Q::tool("Users/avatar", array(
				'userId' => $user->id,
                'editable' => $self,
                "icon" => false
            ), "profile-name")?>
            </div>
            <span class="designation">creator</span> <span class="s-name">@<?php echo Q_Utils::normalize($user->username) ?></span>
            <div class="punchline">
                <div class="TokenSociety_profile_greeting" data-val="greeting"><?php
					if (empty($greeting)) {
						echo "Edit Bio";
					} else {
						echo Q::tool('Streams/inplace', array(
							'stream' => $greeting,
							'inplaceType' => 'textarea',
							'URLtoLink' => true,
							'inplace' => array(
								'placeholder' => $profile['aboutPlaceholder'],
								'editing' => empty($greeting->content),
								'showEditButtons' => true,
								'selectOnEdit' => false
							),
							'convert' => array("\n")
						), uniqid());
					} ?>
                </div>
            </div>
        </div>
        <div class="tokensociety_tab_menu_nft_block">
            <div class="tab-menu-block">
                <button class="Q_button" name="showcase"><?php echo $params["Showcase"] ?></button>
                <button class="Q_button" name="created"><?php echo $params["Created"] ?></button>
                <button class="Q_button" name="createCollection"><?php echo $params["me"]["CreateCollection"] ?></button>
                <button class="Q_button" name="becomeCreator"><?php echo $params["me"]["BecomeCreator"] ?></button>
            </div>
            <?php echo Q::tool('TokenSociety/NFT/filter') ?>
        </div>

        <div class="flex-container">
        
		<?php
            $categoryStream = Streams::fetchOne($user->id, $user->id, "TokenSociety/user/NFTs");
            echo Q::tool("Streams/related", array(
	            "publisherId" => $categoryStream->publisherId,
	            "streamName" => $categoryStream->name,
	            "closeable" => true,
	            "editable" => true,
				"realtime" => true,
				"sortable" => false,
	            "relationType" => "NFT",
	            "relatedOptions" => array(
	                "ascending" => true
                ),
	            "creatable" => array(
	            	"TokenSociety/NFT" => array(
						"title" => "New NFT"
					)
				)
            )); ?>
        </div>




        <a href="#" class="loadmore"><?php echo $params["LoadMore"] ?></a>
    </div>

    <?php include "snippets/footer.php" ?>

</div>